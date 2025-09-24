import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Stack,
  useStyleConfig,
  background,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { login, verifyOtp } from "../actions/userActions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from './images/logo/Vmuktilogo.png';

const Login = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Array to store individual OTP digits
  const [otpSent, setOtpSent] = useState(false);
  const [mobileForOtp, setMobileForOtp] = useState("");

  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(10);

  const inputRefs = useRef([]); // Ref to focus on next input

  useEffect(() => {
    const timer = setTimeout(() => {
      if (resendTimer > 0) {
        setResendTimer(resendTimer - 1);
      } else {
        setResendDisabled(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setMobile(value);
    }
  };

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      setMobileForOtp(mobile);
      const response = await login(name, mobile);
      console.log("response", response);
      setOtpSent(true);
      setResendDisabled(true);
      setResendTimer(30);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignIn = async () => {
    try {
      console.log("Signing in with OTP:", otp, "for mobile:", mobileForOtp);
      const otpString = otp.join(""); // Convert OTP array to a string
      const response = await verifyOtp(mobile, otpString);

      if (response && response.success) {
        localStorage.setItem("name", name);
        localStorage.setItem("mobile", mobile);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.role);
        console.log("response", response);
        setMobileForOtp("");

        if (response.role === "district") {
          navigate("/head");
        } else if (response.role === "checkpost") {
          navigate("/attendance");
        } else if (response.role === "punjabInstaller") {
          navigate("/punjabInstaller");
        } else {
          navigate("/autoinstaller");
        }
      } else {
        console.error("Failed to sign in:", response.message);
        toast.error("Invalid OTP / Mobile No.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setLocationEnabled(true);
    }

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userRole = localStorage.getItem("role");

    console.log(isLoggedIn, userRole);

    if (isLoggedIn) {
      if (userRole === "district") {
        navigate("/head");
      } else {
        navigate("/autoinstaller");
      }
    }
  }, []);

  const handleClearInputs = () => {
    setName("");
    setMobile("");
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]); // Clear the OTP array
  };

  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus on the next input if a digit is entered
      if (value && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Base styles for buttons (shared properties)
  const buttonBaseStyles = {
    width: "370px",
    height: "40px",
    right: "68px",
    top: "100px",

    flexShrink: 0,
    borderRadius: "8px",
    fontFamily: "Inter",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "24px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    color: "white",
  };

  const otpInputStyles = {
    width: "45.22px",
    height: "41.22px",
    flexShrink: 0,
    borderRadius: "4px",
    background: "#F4F4F5",
    textAlign: "center",
    fontFamily: "Wix Madefor Display",
    fontSize: "25px",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "20px",
    color: "#3F77A5",
    margin: "0.10rem", //Added small margin for spacing
  };

  return (<div style={{
      position: "fixed",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      background: "#F4F4F5",
      zIndex: 10,
    }}>
    <Container
      maxW="lg"
      py={{ base: "12", md: "24" }}
      px={{ base: "0", sm: "8" }}
      
      
    >
      <ToastContainer />
      <Stack spacing="8">
        <Stack spacing="6">
          <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
             <Heading  display='flex' justifyContent='center' alignItems='center'><img width="157px"
            height= "40px" src={logo} />&nbsp;</Heading>
            <Heading
              fontSize="30px"
              fontWeight="700"
              color="#1A1A1A"
              fontFamily="Inter"
              textAlign="center"
              fontStyle="normal"
              lineHeight="normal"
              letterSpacing="-0.4px"
            >
              Login to your account
            </Heading>
          </Stack>
        </Stack>
        
        <Box
          py={{ base: "0", sm: "8" }}
          px={{ base: "4", sm: "10" }}
          // bg={{ base: 'transparent', sm: 'bg.surface' }}
          //boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: "none", sm: "xl" }}
        >
          <Stack spacing="5">
            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                bg="white"
                value={name}
                onChange={handleNameChange}
               
              />
            </FormControl>
            <FormControl >
              <FormLabel htmlFor="mobile">Mobile Number</FormLabel>
              <InputGroup height="44px" width="325px">
                <InputLeftAddon children="+91" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  bg="white"
                  value={mobile}
                  onChange={handleMobileChange}
                  
                />
              </InputGroup>
            </FormControl>
            {otpSent && (
              <FormControl >
                <FormLabel htmlFor="otp">OTP</FormLabel>
                <HStack>
                  {otp.map((digit, index) => (
                    <Input
                    
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      sx={otpInputStyles}
                      ref={(el) => (inputRefs.current[index] = el)} // Store refs for focus
                    />
                  ))}
                </HStack>
              </FormControl>
            )}
          </Stack>
         
        </Box>
        
      </Stack>
      
    </Container>
    
 <Stack spacing="6">
  {locationEnabled && !otpSent && (
  <Button
    onClick={handleSendOtp}
    sx={{
      position: "fixed",
      bottom: "5",
      left: "50%",
      transform: "translateX(-50%)",
      width: "325px",
      height: "44px",
      flexShrink: 0,
      borderRadius: "8px",
      fontFamily: "Inter",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "24px",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      color: "white",
      background: "#3F77A5",
      _hover: {
        background: "#305e82",
      },
    }}
  >
    Send OTP
  </Button>
)}


  {!locationEnabled && (
    <Text color="red.500">Please enable location to proceed.</Text>
  )}

  {otpSent && locationEnabled && (
    <>
   <div
  style={{
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    height: "75px", // Adjust as needed
    backgroundColor: "white", // Black background
    zIndex: 9, // Behind the button
    borderRadius :"16px 16px 0 0"
  }}
>
  <Button
    onClick={handleSignIn}
    sx={{
      position: "fixed",
      bottom: "3", // Adjusted so it's inside the black bar
      left: "50%",
      transform: "translateX(-50%)",
      width: "325px",
      height: "44px",
      flexShrink: 0,
      borderRadius: "8px",
      fontFamily: "Inter",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "24px",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      color: "white",
      background: "#3F77A5",
      zIndex: 10,
      _hover: {
        background: "#305e82",
      },
    }}
  >
    Sign In
  </Button>
</div>


      <Box
  width="100%"
  display="flex"
  justifyContent="flex-end"
  mb="2"
  pr="2"
  position="relative"
  top="-10px"
>
  {resendDisabled ? (
    <Text fontSize="sm" color="red.500">
      Resend OTP ({resendTimer})
    </Text>
  ) : (
    <Text
      fontSize="sm"
      color="blue.500"
      cursor="pointer"
      onClick={handleSendOtp}
      opacity={resendDisabled ? 0.5 : 1}
      _hover={{ textDecoration: "underline" }}
    >
      Resend OTP
    </Text>
  )}
</Box>

    </>
  )}

  <HStack>
    <Divider />
    <Divider />
  </HStack>
</Stack>

</div>
  );
  
};

export default Login;
