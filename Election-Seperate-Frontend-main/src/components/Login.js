import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useHistory, useNavigate } from 'react-router-dom'
import { login, verifyOtp } from '../actions/userActions';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomPasswordField = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormControl>
      <FormLabel htmlFor="password">OTP</FormLabel>
      <InputGroup>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
        />
        <InputRightElement width="3rem">
          <IconButton
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
            h="1.75rem"
            size="sm"
            onClick={handleTogglePassword}
          />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
};

const Login = () => {

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mobileForOtp, setMobileForOtp] = useState('');

  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (resendTimer > 0) {
        setResendTimer(resendTimer - 1);
      } else {
        setResendDisabled(false); // Enable the resend button when timer reaches 0
      }
    }, 1000);

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, [resendTimer]);



  // Event handler for name input change
  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  // Event handler for mobile input change
  // const handleMobileChange = (event) => {
  //   setMobile(event.target.value);
  // };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setMobile(value);
    }
  };

  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSendOtp = async () => {
    try {
      // Call the login function from userActions.js
      setMobileForOtp(mobile);
      const response = await login(name, mobile);
      console.log("response", response);
      setOtpSent(true);
      setResendDisabled(true); // Disable the resend button
      setResendTimer(30);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignIn = async () => {
    // Use the stored mobile number when making the API call to sign in
    try {
      // Call the login function from userActions.js
      console.log('Signing in with OTP:', otp, 'for mobile:', mobileForOtp);
      const response = await verifyOtp(mobile, otp);

      if (response && response.success) {
        // Set any user-related data in localStorage if needed
        localStorage.setItem('name', name);
        localStorage.setItem('mobile', mobile);
        localStorage.setItem('isLoggedIn', "true");
        localStorage.setItem('token', response.token)
        localStorage.setItem('role', response.role)
        console.log("response", response);
        setMobileForOtp('');

        if (response.role === 'district') {
          navigate('/head');
        } else if (response.role === 'checkpost') {
          navigate('/attendance');
        } else if (response.role === 'punjabInstaller') {
          navigate('/punjabInstaller');
        } else {
          navigate('/autoinstaller');
        }
        // navigate('/installer'); // Navigate to '/installer' only when the response is true
      } else {
        // Handle the case when the response is not true (you may show an error message)
        console.error('Failed to sign in:', response.message);
        toast.error('Invalid OTP / Mobile No.', {
          position: 'top-right',
          autoClose: 5000, // 5 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }


    } catch (error) {
      console.error(error);
    }

    // Add logic to verify OTP and sign in the user
    // This can involve making an API call to your backend
  };

  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    // Check if Geolocation is supported by the browser
    if ('geolocation' in navigator) {
      setLocationEnabled(true);
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === "true";
    const userRole = localStorage.getItem('role');

    console.log(isLoggedIn, userRole);

    if (isLoggedIn) {
      if (userRole === 'district') {
        navigate('/head');
      }
      //  else if (userRole === 'autoinstaller') {
      //   navigate('/autoinstaller');
      // } 
      else {
        navigate('/autoinstaller');
      }
    }

  }, []);

  const [location, setLocation] = useState("");

  useEffect(() => {
    // Check if Geolocation is supported by the browser
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const successHandler = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
    };

    // const errorHandler = (error) => {
    //   setError("Unable to retrieve your location");
    // };

    // Request user's location
    navigator.geolocation.getCurrentPosition(successHandler);
  }, []);

  const handleClearInputs = () => {
    setName('');
    setMobile('');
    setOtpSent(false);
  };


  return (

    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <ToastContainer />
      <Stack spacing="8">
        <Stack spacing="6">
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={{ base: 'xs', md: 'sm' }}>Log in to your account</Heading>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'bg.surface' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Stack spacing="6">
            <Stack spacing="5">
              <FormControl>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={handleNameChange} />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="mobile">Mobile Number</FormLabel>
                <InputGroup>
                  <InputLeftAddon children="+91" />
                  <Input id="mobile" type="tel" placeholder="Enter your mobile number" value={mobile} onChange={handleMobileChange} />
                </InputGroup>
              </FormControl>
              {otpSent && (
                <FormControl>
                  <FormLabel htmlFor="otp">OTP</FormLabel>
                  <Input id="otp" type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </FormControl>
              )}
            </Stack>
            <Stack spacing="6">
              {locationEnabled && !otpSent && (
                <Button onClick={handleSendOtp} bg='rgba(15,106,141,0.5)'>Send OTP</Button>
              )}
              {/* {otpSent && locationEnabled && ( */}

              {/* )} */}
              {!locationEnabled && (
                <>
                  <Text color="red.500">Please enable location to proceed.</Text>
                </>
              )}
              {/* {otpSent && locationEnabled && (
                <>
                  <Button onClick={handleSignIn}>Sign In</Button>
                  <HStack justify="flex-end" align="flex-end">
                    <Text fontSize="sm" color="blue.500" cursor="pointer" onClick={handleSendOtp} opacity={resendDisabled ? 0.5 : 1}>
                      Resend OTP {resendDisabled && `(${resendTimer})`}
                    </Text>
                  </HStack>
                </>
              )} */}
              {otpSent && locationEnabled && (
                <>
                  <Button bg='rgba(15,106,141,0.5)' onClick={handleSignIn}>Sign In</Button>
                  <HStack justify="flex-end" align="flex-end">
                    {resendDisabled ? (
                      <Text fontSize="sm" color="blue.500" opacity={0.5}>
                        Resend OTP ({resendTimer})
                      </Text>
                    ) : (
                      <Text fontSize="sm" color="blue.500" cursor="pointer" onClick={handleSendOtp}>
                        Resend OTP
                      </Text>
                    )}
                  </HStack>
                </>
              )}


              <HStack>
                <Divider />
                <Divider />


                <Button w='100%' onClick={handleClearInputs}>Clear Inputs</Button>

              </HStack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
