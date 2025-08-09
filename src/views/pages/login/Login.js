import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import bgImage from 'src/assets/images/EtudeAADL.jpg';

import { login } from '../../../../api/Auth';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(username, password); // Call the login function from the API file

      // Store the returned data in localStorage
      /*
      localStorage.removeItem('accessType');
      localStorage.setItem('accessType', data.accessType);
      localStorage.removeItem('numero_organisation');
      localStorage.setItem('numero_organisation', data.numero_organisation);
      localStorage.removeItem('token');
      localStorage.setItem('token', data.token);*/

      localStorage.setItem('token', data.token);
  localStorage.setItem('userId', data.userId);
  localStorage.setItem('userRole', data.userRole);
  localStorage.setItem('userDr', data.userDr);
  localStorage.setItem('userName', data.userName);

      setMessage('Login successful!');
      navigate('/dashboard'); // Navigate to the dashboard
    } catch (error) {
      setMessage(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center"
  
    >
      <CContainer>
        <CRow className="justify-content-center"  >
          <CCol md={7} >
            <CCardGroup style={{border:"0",boxShadow:" rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px"}}>
              <CCard className="p-4">

              <CCard
                className="  py-5"
                style={{
                  backgroundSize:"contain",
                  backgroundImage: `url(${bgImage})`,
                  border:"0",
                  backgroundPosition: 'center',
                  backgroundColor:'transparent',
                  backgroundRepeat: 'no-repeat',
                }}
              >
               
              </CCard>
                <CCardBody>
                  <CForm onSubmit={handleLogin} style={{textAlign:"center"}}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Connectez-vous à votre compte</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol>
                        <CButton color="primary" className="px-4" type="submit">
                          Connecter
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                  {message && (
                    <p
                      style={{
                        marginTop: '20px',
                        color: message.includes('successful') ? 'green' : 'red',
                      }}
                    >
                      {message}
                    </p>
                  )}


                </CCardBody>
                
              </CCard>
             
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
