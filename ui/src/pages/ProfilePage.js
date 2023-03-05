import React, { useState, useEffect } from 'react';
import LoadingScreen from '../common/LoadingScreen';
import axiosInstance from '../helpers/axios';
import ProfileForm from '../components/profile/profile-form';

const ProfilePage = () => {
  const [userProfileData, setUserProfileData] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get('users/me')
      .then((result) => {
        setLoading(false);
        setUserProfileData(result.data);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      {loading ? <LoadingScreen /> : null}
      <ProfileForm initialValues={userProfileData} />
    </>
  );
};

export default ProfilePage;
