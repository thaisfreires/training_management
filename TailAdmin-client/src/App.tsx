import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import DefaultLayout from './layout/DefaultLayout';
import PendingTraining from './pages/Training/PendingTraining';
import AvailableCourses from './pages/Training/AvailableCourses';
import NotFound from './pages/NotFound/notFound';
import NewCourse from './pages/Form/NewCourseForm';
import Charts from './pages/Training/Charts';
import HomePage from './pages/Dashboard/HomePage';
import UploadFilesForm from './pages/Form/Upload_form';
import UpdateCourse from './pages/Form/EditCourseForm';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Routes>
      <Route
          path="/"
          element={
            <>
              <PageTitle title="Dashboard" />
              <HomePage />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="Dashboard" />
              <HomePage />
            </>
          }
        />
        <Route
          path="/files/uploads"
          element={
            <>
              <PageTitle title="Upload Files" />
              <UploadFilesForm />
            </>
          }
        />
        <Route
          path="/files/list"
          element={
            <>
              <PageTitle title="FileList" />
              <PendingTraining />
            </>
          }
        />
        <Route
          path="/files/<filename>"
          element={
            <>
              <PageTitle title="View File" />
            </>
          }
        />

        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <SignUp />
            </>
          }
        />
        <Route
          path="/courses"
          element={
            <>
              <PageTitle title="Availabe Courses" />
              <AvailableCourses />
            </>
          }
        />
        <Route
          path="/courses/new"
          element={
            <>
              <PageTitle title="New Courses" />
              <NewCourse />
            </>
          }
        />
        <Route
          path="/courses/update"
          element={
            <>
              <PageTitle title="Update Course" />
              <UpdateCourse />
            </>
          }
        />
        <Route
          path="/charts"
          element={
            <>
              <PageTitle title="Charts" />
              <Charts />
            </>
          }
        />
        <Route
          path="/PageNotFound"
          element={
            <>
              <PageTitle title="Page Not Found" />
              <NotFound />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
