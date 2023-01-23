import React, { useState, useEffect } from 'react';
import axiosInstance from '../helpers/axios';
import ProfileForm from '../components/profile/profile-form';

const ProfilePage = () => {
  const [userProfileData, setUserProfileData] = useState({});

  useEffect(() => {
    axiosInstance.get('users/me').then((result) => {
      setUserProfileData(result.data);
    });
  }, []);

  return (
    <>
      <ProfileForm initialValues={userProfileData} />
    </>
  );
};

export default ProfilePage;
