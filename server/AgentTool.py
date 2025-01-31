import pandas as pd
import datetime
import os, re
from time import time
from dotenv import load_dotenv
from langchain.agents import initialize_agent, Tool
from langchain_groq import ChatGroq
from fpdf import FPDF
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

load_dotenv()

MAX_WITHOUT_TRAINING = int(os.getenv('MAX_WITHOUT_TRAINING', 0))
FILE_PATH_EMPLOYEES = os.path.join('.', 'docs', 'Employees.csv')
FILE_PATH_TRAINING = os.path.join('.', 'docs', 'Training.csv')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
SENDER_EMAIL=os.getenv('SENDER_EMAIL')
RECIPIENT_EMAIL=os.getenv('RECIPIENT_EMAIL')
 
def read_employee_csv(FILE_PATH_EMPLOYEES, filter_by_date=True):
    """Reads employee data from CSV file."""
    employees_df = pd.read_csv(FILE_PATH_EMPLOYEES, sep=';')
    employees_df.columns = employees_df.columns.str.strip()
    cols = [col for col in employees_df.columns if 'training' in col.lower() and 'date' in col.lower()]
    last_training_column = cols[0]

    if filter_by_date:
        employees_df[last_training_column] = pd.to_datetime(employees_df[last_training_column])
        three_months_ago = pd.Timestamp.now() - datetime.timedelta(days=MAX_WITHOUT_TRAINING)

        employees_df = employees_df[employees_df[last_training_column] <= three_months_ago]

    sorted_df = employees_df.sort_values(by='Name')
    return sorted_df
 
def read_training_csv(FILE_PATH_TRAINING):
    """Reads Training data from CSV file."""
    df = pd.read_csv(FILE_PATH_TRAINING, sep=';')
    df.columns = df.columns.str.strip()
    return df

def prepare_prompt(employee, trainings):
    prompt = f"""

    
    Acording to this Training Courses List: {", ".join(trainings)}, make assumption on which training courses are the best option for this employee?
    Please, answer in english and strictly answer only what's inside the following structure:

    
    Employee: {employee['Name']}
    Department: {employee['Department']}
    Suggested Training Courses: 
    1.
    2.
    3.
    
    """
    return prompt
 
read_employees_tool = Tool(
    name="Read Employees CSV",
    func=lambda _: read_employee_csv(FILE_PATH_EMPLOYEES).to_dict(orient='records'),
    description="Reads the employee list."
)
 
read_trainings_tool = Tool(
    name="Read Trainings CSV",
    func=lambda _: read_training_csv(FILE_PATH_TRAINING),
    description="Reads the list of training courses available."
)
  
llm = ChatGroq(model="llama3-70b-8192")
tools = [read_employees_tool, read_trainings_tool]
initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)

def pdf_generator(txt_file, pdf_file):
        employees=parse_txt_file(txt_file)

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, ' TRAINING SUGGESTIONS REPORT ', 0, 1, align='C')
        pdf.ln(5)

        for entry in employees:

            pdf.set_font('Arial', 'B', 12)
            pdf.set_x(pdf.l_margin)           
            pdf.cell(0, 10, f"Employee: {entry['Employee']}", 0 ,1)    

            pdf.set_font('Arial', 'B', 12)
            pdf.set_x(pdf.l_margin) 
            pdf.cell(0, 8, f"Department: {entry['Department']}", 0, 1)
            
            pdf.cell(0, 8, "Suggested Training Courses:", 0 , 1)
            for idx, course in enumerate(entry['Training'], start=1):
                pdf.set_font('Arial', '', 12)
                pdf.cell(0, 8, f"  {idx}. {course}", ln=True)
            pdf.ln(5)  
        
        pdf.output(pdf_file)
        print(f"------->  PDF saved as: {pdf_file}")

def parse_txt_file(txt_file):
    employees=[]
    
    with open(txt_file, 'r') as file:
       content=file.read()
    employee_blocks=re.split(r'\n\s*\n', content.strip())

    for block in employee_blocks:
        employee_match = re.search(r'Employee:\s*(.+)', block)
        department_match = re.search(r'Department:\s*(.+)', block)
        training_courses = re.findall(r'\d+\.\s*(.+)', block)

        if employee_match and department_match:
            employee = employee_match.group(1).strip()
            department = department_match.group(1).strip()
            employees.append({
                "Employee": employee,
                "Department": department,
                "Training": training_courses
            })
    return employees
        
employees = read_employee_csv(FILE_PATH_EMPLOYEES).to_dict(orient='records')
trainings = read_training_csv(FILE_PATH_TRAINING)
    
docs_folder = os.path.join('.', 'PDF_generator')
os.makedirs(docs_folder, exist_ok=True)

base_name_pdf = "TrainingSuggestions"
pdf_extension = ".pdf"
unix_time = int(time())
pdf_file = os.path.join(docs_folder, f"{base_name_pdf}_{unix_time}{pdf_extension}")

txt_extension = ".txt"
base_name_txt = unix_time
txt_file = os.path.join(docs_folder, f"{base_name_txt}{txt_extension}")



for employee in employees:
    prompt = prepare_prompt(employee, trainings)
    response = llm.invoke(prompt)    
    
    with open(txt_file,"a") as file:
        file.write(response.content)
        file.write("\n") 
    file.close()


def sendEmail():
    subject = "Monthly Training Suggestions"
    body = (
    "Dear HR representative,\n\n"
    "This is an automated email notification. Please do not reply to this message.\n\n"
    "Attached, you will find the document titled Training Suggestions corresponding to the current month for employees who are past due in their training.\n"
    "This report and also the latest ones, are available for vizualization and download on our web page.\n"
    "Please review the attached document carefully. If you have any questions or need further assistance, "
    "contact the HelpDesk.\n\n"
    "Thank you for your attention and cooperation.\n\n"
    )
    sender_email = SENDER_EMAIL
    recipient_email = RECIPIENT_EMAIL
    sender_password = SENDER_EMAIL
    smtp_server = 'smtp.gmail.com'
    smtp_port = 465
    path_to_file = os.path.join('.', 'PDF_generator')
    latest_file = max((f for f in os.listdir(path_to_file) if f.endswith('.pdf')),
    key=lambda f: os.path.getmtime(os.path.join(path_to_file, f)))
    latest_file_path = os.path.join(path_to_file, latest_file)

    message = MIMEMultipart()
    message['Subject'] = subject
    message['From'] = sender_email
    message['To'] = recipient_email
    body_part = MIMEText(body)
    message.attach(body_part)

    with open(latest_file_path,'rb') as file:
        message.attach(MIMEApplication(file.read(), Name="TrainingSuggestions"))
    
    with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, recipient_email, message.as_string())
        print(f"------->  Email generated and sent to: {recipient_email}")


def start_agent():
    initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
    pdf_generator(txt_file, pdf_file)
    sendEmail()    


