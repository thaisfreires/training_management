import { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import React from 'react';

const UploadFilesForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<{
    displayName: string;
    uploadDate: string;
    fileType: string;
    fileSize: string;
  } | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/files/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Upload successful: ' + data.message);

        setUploadedFileData({
          displayName: selectedFile.name,
          uploadDate: new Date().toISOString(),
          fileType: selectedFile.type || 'Unknown',
          fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        });

        // Reset selected file
        setSelectedFile(null);
        
      } else {
        setUploadError('Upload failed: ' + data.error);
        setUploadedFileData(null);
        alert('Upload failed: ' + data.error);
      }
    } catch (error: any) {
      // console.error('Error uploading file:', error);
      alert('Upload error: ' + error.message);
      setUploadError('Upload error: ' + error.message);
      setUploadedFileData(null);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Upload Reports" />

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Upload Files
                </h3>
              </div>

              <div className="p-7">
                <form onSubmit={handleUpload} encType="multipart/form-data">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div>
                      <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        name="file"
                        className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 inline-flex items-center justify-center rounded bg-primary py-3 px-10 font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-dark"
                    
                    >
                    Upload
                  </button>
                </form>

                {/* Display uploaded file metadata */}
                {uploadError && <div className="text-red-500 mt-4">{uploadError}</div>}
                {uploadedFileData && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium text-black dark:text-white">Uploaded File Details:</h4>
                    <p>Name: {uploadedFileData.displayName}</p>
                    <p>Type: {uploadedFileData.fileType}</p>
                    <p>Size: {uploadedFileData.fileSize}</p>
                    <p>Upload Date: {new Date(uploadedFileData.uploadDate).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadFilesForm;
