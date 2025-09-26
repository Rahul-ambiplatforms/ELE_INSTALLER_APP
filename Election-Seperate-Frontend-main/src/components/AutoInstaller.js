import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import logo from "./images/logo/cam.png";
// import "./auto-installer.css";
import {
  Button,
  Container,
  Flex,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  Checkbox,
  border, // Import Checkbox from Chakra UI
  Box,
  Image,Grid,
  Collapse
} from "@chakra-ui/react";
import { ToastContainer, toast } from "react-toastify";
import {
  getAcdetails,
  getCamera,
  getCameraByDid,
  getCamerasByNumber,
  getDistrictDetails,
  getFullDid,
  getSetting,
  installCamera,
  removeEleCamera,
  setSetting,
  trackLiveLatLong,
  updateCamera,
  getCameraStatus,
} from "../actions/userActions"; // Import the new action
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import withAuth from "./withAuth";
// import { ReactFlvPlayer } from 'react-flv-player';
import videojs from "video.js";
import "video.js/dist/video-js.css";
import ReactPlayer from "react-player";
import QRCodeScanner from "./QrCodeScanner";
import TawkToWidget from "./tawkto";
import { LuFlipHorizontal2, LuFlipVertical2 } from "react-icons/lu";
import Autosuggest from "react-autosuggest";
import { IoIosRefresh } from "react-icons/io";
import { FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
//import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa"; // Import sorting icons
import sortIcon from "./images/logo/sort.png"; // Import the image
import line from "./images/logo/line.png";
import expand from "./images/logo/expand.png";

const AutoInstaller = () => {

// State
const [expandedCameraId, setExpandedCameraId] = useState(null);

const handleToggleExpand = (id) => {
  setExpandedCameraId((prevId) => (prevId === id ? null : id));
};
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [boothNo, setBoothNo] = useState("");
  const [excelLocation, setExcelLocation] = useState(" ");
  const [state, setState] = useState(" ");
  const [stateu, setStateu] = useState(" ");
  const [punjab, setPunjab] = useState(" ");
  const [tripura, setTripura] = useState(" ");

  const [prourl, setProurl] = useState("");

  // NEW STATE VARIABLES
  const [cameraStatus, setCameraStatus] = useState(null);
  const [blurChecked, setBlurChecked] = useState(false);
  const [blackviewChecked, setBlackviewChecked] = useState(false);
  const [brightnessChecked, setBrightnessChecked] = useState(false);
  const [blackAndWhiteChecked, setBlackAndWhiteChecked] = useState(false);
  const [cameraAngleAcceptable, setCameraAngleAcceptable] = useState(true);

  // useRef to hold the interval ID
  const toastInterval = useRef(null);

  // useRef to hold the interval ID for camera status polling
  const cameraStatusInterval = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const camerasPerPage = 10; // Adjust as needed
  const [cameraa, setCameraa] = useState([]); // Keep cameraa as state
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const totalCameras = cameraa.length;
  const totalPages = Math.ceil(totalCameras / camerasPerPage); // Calculate the number of pages

  useEffect(() => {
    camera();
    did();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setLatie(latitude);
          setLongie(longitude);

          setLocation({ latitude, longitude });

          try {
            const responsee = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBNBVfpAQqikexY-8J0QDyBR4bWKiKe`
            );
            setAddress(responsee.data.results[0].formatted_address);
            setStateu(
              responsee.data.plus_code.compound_code.split(",")[1].toUpperCase()
            );
          } catch (error) {
            console.error("Error fetching address:", error.message);
          }
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }

    return () => {
      console.log(
        "AutoInstaller component unmounting OR deviceId changed. Clearing intervals."
      );
      clearInterval(toastInterval.current);
      clearInterval(cameraStatusInterval.current);
    };
  }, [deviceId]);

  const handleGetData = async (deviceId, setting) => {
    const response = await getCameraByDid(deviceId);
    const getset = await getSetting(deviceId, response.flvUrl.prourl);

    let modifiedData = {
      ...getset.data,
      appSettings: {
        ...getset.data.appSettings,
        imageCfg: {
          ...getset.data.appSettings.imageCfg,
          [setting]: getset.data.appSettings.imageCfg[setting] === 1 ? 0 : 1,
        },
      },
    };

    console.log("Modified data:", modifiedData);

    const setSet = await setSetting(
      response.flvUrl.prourl,
      modifiedData.appSettings
    );
  };

  const handleAddInputs = async () => {
    setShowAdditionalInputs(true);
    clearInterval(cameraStatusInterval.current);
    clearInterval(toastInterval.current);
    const response = await getCameraByDid(deviceId);
    if (!response?.flvUrl?.url2) {
      toast.error(
        `Please Enter Full DeviceID 'OR' URL2 is not available, so contact Support`,
        {
          position: "top-right",
          autoClose: 3500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return;
    }

    setFlvUrl(response.flvUrl.url2);
    if (!response.success) {
      toast.error("Failed to get camera data", {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      toast.error(
        "Plz connect support team before installing camera, from below right corner...",
        {
          position: "top-right",
          autoClose: 5500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      toast.warning("If testing camera than wait for the view", {
        position: "top-right",
        autoClose: 5500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (response.data.state === "PUNJAB") {
      toast.error("State is PUNJAB. Refreshing the page...", {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    setState(response.data.state);
    setAssemblyName(response.data.assemblyName);
    setPsNumber(response.data.psNo);
    setDistrict(response.data.district);
    setExcelLocation(response.data.location);

    sendUrlToExternalApi(response.flvUrl.url2);

    startCameraStatusPolling(deviceId);
  };

  const startCameraStatusPolling = (deviceId) => {
    fetchCameraStatus(deviceId);

    cameraStatusInterval.current = setInterval(() => {
      fetchCameraStatus(deviceId);
    }, 15000);
  };

  const fetchCameraStatus = async (deviceId) => {
    const toastStyle = {
        fontSize: '12px', // Smaller font
        padding: '8px 12px', // Reduced padding
    };
    try {
      const status = await getCameraStatus(deviceId);

      if (status.success === false) {
        console.log("Api status false");
        setCameraStatus(null);
        return;
      } else {
        console.log("Api status true");
        setCameraStatus(status);
        setBlurChecked(status.blur);
        setBlackviewChecked(status.blackview);
        setBrightnessChecked(status.brightness);
        setBlackAndWhiteChecked(status.BlackAndWhite);
        const cameraAngle = Math.abs(status.camera_angle);
        setCameraAngleAcceptable(cameraAngle <= 15);

        if (cameraAngle > 15) {
          if (!toastInterval.current) {
            toastInterval.current = setInterval(() => {
              toast.warn(
                "Try to adjust the angle of camera. The angle of camera should be in range of 0-15 degree",
                {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  style: toastStyle // Apply inline styles here
                }
              );
            }, 9000);
          }
        } else {
          clearInterval(toastInterval.current);
          toastInterval.current = null;
        }
      }

      if (status.blur) {
        toast.warn("Camera is blur, try to fix it!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      if (status.blackview) {
        toast.warn("Camera having black view, try to fix it!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      if (!status.brightness) {
        toast.warn("Check the brightness of the camera!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      if (status.BlackAndWhite) {
        toast.warn("Camera is black and white!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching camera status:", error);
    }
  };

  const sendUrlToExternalApi = async (url2) => {
    try {
      let rtmpUrl = url2.replace("https", "rtmp");

      const url = new URL(rtmpUrl);
      const hostname = url.hostname;

      if (!hostname.includes(":")) {
        rtmpUrl = rtmpUrl.replace(hostname, `${hostname}:80`);
      }

      rtmpUrl = rtmpUrl.replace(".flv", "");

      console.log("Transformed URL:", rtmpUrl);

      const postData = { rtmp: rtmpUrl };
      console.log("My data is", postData);

      const response = await axios.post(
        "https://installerapp.vmukti.com:8443/analyze-camera",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("External API Response:", response.data);
      toast.success("Successfully Fetched Camera Status", {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error sending URL to external API:", error);
    }
  };

  const refresh = () => {
    window.location.reload();
  };

  const handleDeleteClick = async (id) => {
    try {
      console.log("getId", id);
      const response = await removeEleCamera(id);
      camera();
    } catch (error) {
      console.error("Error updating consignment:", error);
    }
  };

  const [latie, setLatie] = useState("");
  const [longie, setLongie] = useState("");
  const namee = localStorage.getItem("name");
  const mobilee = localStorage.getItem("mobile");
  const handleSubmit = async () => {
    try {
      let latitude = location.latitude;
      let longitude = location.longitude;

      const currentTime = new Date();
      const formattedDate = currentTime.toLocaleDateString("en-GB");
      const formattedTime = currentTime.toLocaleTimeString("en-US", {
        hour12: false,
      });

      let installed_status = 1;
      let status = "RUNNING";
      console.log(
        "Submitted:",
        deviceId,
        namee,
        mobilee,
        assemblyName,
        psNumber,
        state,
        district,
        excelLocation,
        latitude,
        longitude,
        installed_status,
        status
      );
      const response = await installCamera(
        deviceId,
        namee,
        mobilee,
        assemblyName,
        psNumber,
        state,
        district,
        excelLocation,
        latitude,
        longitude,
        installed_status,
        status,
        formattedDate,
        formattedTime
      );
      console.log("response of submit", response);
      camera();
      setState("");
      setDistrict("");
      setAssemblyName("");
      setPsNumber("");
      setExcelLocation("");
      setShowAdditionalInputs(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    trackData();
  }, [namee, mobilee, latie, longie]);

  const trackData = async () => {
    try {
      let latitude = location.latitude;
      let longitude = location.longitude;
      const currentTime = new Date();
      const formattedDate = currentTime.toLocaleDateString("en-GB");
      const formattedTime = currentTime.toLocaleTimeString("en-US", {
        hour12: false,
      });
      const responsee = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBNBVfpAQqikexY-8J0QDyBR4bWKiKe`
      );

      const statename = responsee.data.plus_code.compound_code
        .split(", ")[1]
        .toUpperCase();
      const formatted_address = responsee.data.results[6].formatted_address;
      const formatted_address1 = responsee.data.results[7].formatted_address;
      const formatted_address2 = responsee.data.results[8].formatted_address;
      console.log("lala", responsee.data);
      const result = await trackLiveLatLong(
        namee,
        mobilee,
        latitude,
        longitude,
        formattedDate,
        formattedTime,
        statename,
        formatted_address,
        formatted_address1,
        formatted_address2
      );
    } catch (error) {
      console.error("Error tracking data:", error);
    }
  };

  const [editableCameraID, setEditableCameraID] = useState(null);

  const [live, setLive] = useState(0);

  const handleEditClick = (itemId) => {
    console.log(itemId);
    setEditableCameraID(itemId);
  };

  const handleUpdateClick = async (id) => {
    try {
      console.log("getId", id);
      console.log("live:", live);
      const response = await updateCamera(id, live);
      console.log("Consignment updated successfully:", response.data);
      setEditableCameraID(0);
      camera();
    } catch (error) {
      console.error("Error updating consignment:", error);
    }
  };

  const [didList, setDidList] = useState([]);
  const did = async () => {
    try {
      const mobile = localStorage.getItem("mobile");
      const result = await getCamerasByNumber(mobile);
      setDidList(result.data);
    } catch (error) {
    } finally {
    }
  };

  const camera = async () => {
    try {
      const mobile = localStorage.getItem("mobile");
      const result = await getCamera(mobile);
      console.log("cameras data", result.data);

      // Initial sort when data is fetched
      const sortedData = [...result.data].sort((a, b) =>
        a.deviceId.localeCompare(b.deviceId)
      );

      setCameraa(sortedData);
      setCurrentPage(1); // Reset to first page when camera data updates
    } catch (error) {
    } finally {
    }
  };

  const [showAdditionalInputs, setShowAdditionalInputs] = useState(false);
  const [assemblyName, setAssemblyName] = useState("");
  const [flvUrl, setFlvUrl] = useState("");
  const [psNumber, setPsNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [realLocation, setRealLocation] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);

  const handleResize = () => {
    setDeviceWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const isMobileDevice = deviceWidth < 450;
  const handleScanSuccess = (text) => {
    setDeviceId(text);
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const handleViewCamera = (camera) => {
    setSelectedCamera(camera);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = async (event, { newValue }) => {
    setDeviceId(newValue);

    const numericValue = newValue.replace(/\D/g, "");

    if (numericValue.length === 6) {
      setIsLoading(true);
      try {
        const response = await getFullDid(numericValue);
        setSuggestions(response.streamnames);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const inputProps = {
    value: deviceId,
    onChange: handleInputChange,
    placeholder: "Enter Device ID",
    style: {
      width: "240px",
      height: "35px",
      padding: "10px 14px",
      borderRadius: "8px",
      background: "#fff",
      boxShadow: "inset 0 1px 2.4px rgba(0, 0, 0, 0.25)",
      color: "black",
      fontFamily: "'Wix Madefor Text'",
      fontSize: "12px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
    },
  };

  const BlinkingWarningIcon = () => {
    return (
      <FaExclamationTriangle
        color="orange"
        style={{
          animation: "blink-animation 1s steps(5, start) infinite",
        }}
      />
    );
  };

  //Css
  const customCSS = `
@keyframes blink-animation {
    to {
        visibility: hidden;
    }
}

.blink {
    visibility: visible;
    animation: blink-animation 1s steps(5, start) infinite;
}
`;

  // Pagination functions
  const handleClick = (page) => {
    setCurrentPage(page);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Calculate the start and end index for the current page
  const startIndex = (currentPage - 1) * camerasPerPage;
  const endIndex = Math.min(startIndex + camerasPerPage, totalCameras);

  // Get the cameras to display on the current page
  const camerasOnPage = cameraa.slice(startIndex, endIndex);

  // Sorting function
  const handleSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    const sortedData = [...cameraa].sort((a, b) => {
      const psNoA = a.psNo; // Access PS No. directly
      const psNoB = b.psNo;

      if (newSortOrder === "asc") {
        return psNoA - psNoB; // Sort numerically ascending
      } else {
        return psNoB - psNoA; // Sort numerically descending
      }
    });

    setCameraa(sortedData);
    setCurrentPage(1);
  };
  const HorizontalLine = () => (
    <Box width="100%" height="2px" background="#3F77A5" mb={2} />
  );

  return (
    <Container
      backgroundColor="#F4F4F5"
      maxW="100vw"
      p={4}
      px={{ base: "0", sm: "8" }}
      style={{ margin: "0px" }}
    >
      <style>{customCSS}</style>
      {/*  py={{ base: '12', md: '24' }} */}
      <ToastContainer />
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
        }}
      >
        <TawkToWidget />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          bottom: "20px",
          left: "20px",          
        }}
      ></div>
      {location ? (
        <>
          {isMobileDevice && (
            <>
              {" "}
              <QRCodeScanner onScanSuccess={handleScanSuccess} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                OR
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              justifyContent: "center", // Add this line to center horizontally
            }}
          >
            {/* <Text style={{ width: "120px" }}>DeviceID</Text> */}
            {suggestions && suggestions.length >= 0 ? (
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={({ value }) =>
                  handleInputChange(null, { newValue: value })
                }
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={(suggestion) => suggestion}
                renderSuggestion={(suggestion) => <div>{suggestion}</div>}
                inputProps={inputProps}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text>No Camera Found !</Text>
                <Button onClick={refresh}>Go Back</Button>
              </div>
            )}
          </div>

          {showAdditionalInputs && (
            <>
              <ReactPlayer
                url={flvUrl}
                playing={true}
                controls={true}
                width="100%"
                height="50%"
                style={{ marginBottom: "1rem" }}
              />

              {cameraStatus ? (
                <Flex
                  direction="row"
                  align="center"
                  flexWrap="wrap"
                  marginBottom="1.5rem"
                  padding="0.5rem"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  bg="gray.50"
                  width="342px"
                  height="54px"
                  flex-shrink="0"
                >
                  <Text marginRight="0.5rem" fontFamily="Wix Madefor Text">
                    Resolution:
                  </Text>
                  <Text marginRight="1rem" fontFamily="Wix Madefor Text">
                    {cameraStatus.resolution}
                  </Text>

                  <Text marginRight="0.5rem" fontFamily="Wix Madefor Text">
                    Camera Angle:
                  </Text>
                  <Text marginRight="1rem" fontFamily="Wix Madefor Text">
                    {Math.abs(cameraStatus.camera_angle)}
                  </Text>

                  <Text marginRight="0.5rem" fontFamily="Wix Madefor Text">
                    FPS:
                  </Text>
                  <Text marginRight="1rem" fontFamily="Wix Madefor Text">
                    {cameraStatus.fps}{" "}
                  </Text>

                  
                </Flex>
              ) : (
                <Flex
                  align="center"
                  justifyContent="center"
                  marginBottom="1.5rem"
                  padding="0.5rem"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  bg="red.100"
                  color="red.600"
                >
                  <Text fontWeight="bold" marginRight="0.5rem">
                    Fetching Camera Status...
                  </Text>
                  <Text>Please Wait...</Text>
                </Flex>
              )}
              <h1
                style={{
                  fontFamily: "Wix Madefor Text",
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                &nbsp;&nbsp;Camera Feed Status
                <img
                  src={line}
                  alt="Line"
                  style={{
                    width: "200px",
                    height: "1px",
                    marginLeft: "10px",
                    verticalAlign: "middle",
                  }}
                />
              </h1>

              {cameraStatus ? (
                <Flex
  wrap="wrap"
  gap="0.1rem"
  mt="1.5rem"
  mb="1.5rem"
  px="0.5rem"
>
  {[
   { label: blurChecked ? "Blur" : "No Blur", checked: !blurChecked },
  { label: blackviewChecked ? "Black View" : "No Black View", checked: !blackviewChecked },
  { label: "Brightness", checked: brightnessChecked },
  { label: blackAndWhiteChecked ? "Black & White" : "No Black & White", checked: !blackAndWhiteChecked },
  { label: cameraAngleAcceptable ? "Camera Angle OK" : "Camera Angle Issue", checked: cameraAngleAcceptable },
  ].map(({ label, checked }, index) => (
    <Flex
      key={index}
      direction="column"
      align="center"
      gap="0.3rem"
      width="66px" // Controls width so all items are same size and fit one line
    >
      {checked ? (
        <Checkbox
          isChecked={checked}
          isReadOnly
          sx={{
            ".chakra-checkbox__control": {
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              border: "2px solid #7BC111",
              backgroundColor: "white",
              _checked: {
                backgroundColor: "#7BC111",
                color: "white",
                borderColor: "#7BC111",
              },
            },
            ".chakra-checkbox__icon": {
              fontSize: "10px",
            },
          }}
        />
      ) : (
        <BlinkingWarningIcon boxSize="18px" />
      )}
      <Text
        fontSize="10px"
        fontWeight="500"
        textAlign="center"
        lineHeight="1.2"
        whiteSpace="normal"
      >
        {label}
      </Text>
    </Flex>
  ))}
</Flex>

              ) : null}

              <div
                style={{
                 // display: "flex",
                  //flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                  padding:"10px"
                }}
              >
                <Text style={{ width: "120px", fontWeight:500, fontFamily: "Wix Madefor Text"}}>
                  &nbsp; State
                </Text>
                <Input
                  background= "#FFF"
                  fontWeight="500" fontFamily= "Wix Madefor Text" fontSize= "12px" 
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder= "district"
                  
                />
              </div>
              <div
                style={{
                  // display: "flex",
                  // flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                  padding:"10px"
                }}
              >
                <Text style={{ width: "120px", fontWeight:500, fontFamily: "Wix Madefor Text"}}>
                  &nbsp; District
                </Text>
                <Input
                   background= "#FFF"  fontWeight="500" fontFamily= "Wix Madefor Text" fontSize= "12px"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="district"
                />
              </div>
              <div
                style={{
                  // display: "flex",
                  // flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                  padding:"10px"
                }}
              >
                <Text style={{ width: "120px", fontWeight:500, fontFamily: "Wix Madefor Text"}}>
                  &nbsp; Assembly
                </Text>
                <Input
                 background= "#FFF"  fontWeight="500" fontFamily= "Wix Madefor Text" fontSize= "12px"
                  value={assemblyName}
                  onChange={(e) => setAssemblyName(e.target.value)}
                  placeholder="assemblyName"
                />
              </div>
              <div
                style={{
                  // display: "flex",
                  // flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                  padding:"10px"
                }}
              >
                <Text style={{ width: "120px", fontWeight:500, fontFamily: "Wix Madefor Text"}}>
                  &nbsp; PsNo.
                </Text>
                <Input
                 background= "#FFF"  fontWeight="500" fontFamily= "Wix Madefor Text" fontSize= "12px"
                  value={psNumber}
                  onChange={(e) => setPsNumber(e.target.value)}
                  placeholder="psNumber"
                />
              </div>
              <div
                style={{
                  // display: "flex",
                  // flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                  padding:"10px"
                }}
              >
                <Text style={{ width: "120px", fontWeight:500, fontFamily: "Wix Madefor Text"}}>
                  &nbsp; Location
                </Text>
                <Input
                 background= "#FFF"  fontWeight="500" fontFamily= "Wix Madefor Text" fontSize= "12px"
                  value={excelLocation}
                  onChange={(e) => setExcelLocation(e.target.value)}
                  placeholder="excelLocation"
                />
              </div>
            </>
          )}
          {!showAdditionalInputs ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                display="flex"
                justifyContent="center"
                alignItems="center"
                border-radius="8px"
                background="#3F77A5"
                width="200px"
                height="40px"
                color="white"
                onClick={handleAddInputs}
              >
                Camera DID Info
              </Button>
            </div>
          ) : (
            <> <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button 
                display="flex"
                justifyContent="center"
                alignItems="center"
                 width="200px"
                height="40px"
                border-radius="8px"
                background="#3F77A5"
                color="white"
              onClick={handleSubmit}>Submit</Button>
              </div>
            </>
          )}

          <br />
          <br />
          <br />

          <h3
            style={{
              display: "flex",
              justifyContent: "right",
              alignItems: "right",
              gap: "0.5rem",
              textAlign: "right",
              marginBottom: "15px",
            }}
          >
            {/* <Text fontWeight="bold">Camera List</Text> */}
            <Button
              bg="#F4F4F5"
              onClick={refresh}
              height="24px"
              fontFamily="Wix Madefor Text"
            >
              <IoIosRefresh />
              &nbsp;Refresh
            </Button>
            <Text fontWeight="bold" fontFamily="Wix Madefor Text" height="16px">
              SORT {sortOrder === "asc" ? "(A-Z)" : "(Z-A)"}
            </Text>
            <img
              src={sortIcon}
              alt="Sort"
              style={{
                width: "16px",
                height: "20px",
                cursor: "pointer",
              }}
              onClick={handleSort}
            />
          </h3>

      
{camerasOnPage.map((camera) => (
  <Box
    key={camera.deviceId}
    sx={{ borderBottom: "2px solid #3F77A5", pb: 2 }}
    mb={4}
    p={4}
  >
    <Flex justify="space-between" align="center" mb={3}>
       <Box>
      <Text fontWeight="bold" fontFamily="Wix Madefor Text">
        Device ID: {camera.deviceId}
      </Text>
      </Box>

      <Box>
        <Text>{camera.status === "RUNNING" ? "🟢" : "🔴"}</Text>
      </Box>

      {/* Single expand/collapse image with rotation */}
      <IconButton
        aria-label="Expand/Collapse Details"

        icon={
          <Image
            src={expand}
             onClick={() => handleToggleExpand(camera.deviceId)}
            alt="Expand"
            sx={{
              transform: expandedCameraId === camera.id ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        }
      />
    </Flex>

    {/* Expanded View */}
    {expandedCameraId === camera.deviceId && (
      <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={2}>
        <Box>
          <Text fontFamily="Wix Madefor Text" fontWeight="bold">District</Text>
          <Text fontFamily="Wix Madefor Text" >{camera.district}</Text>
        </Box>

        <Box>
          <Text fontFamily="Wix Madefor Text" fontWeight="bold">Assembly Name</Text>
          <Text fontFamily="Wix Madefor Text">{camera.assemblyName}</Text>
        </Box>

        <Box>
          <Text fontFamily="Wix Madefor Text" fontWeight="bold">PS No.</Text>
          <Text fontFamily="Wix Madefor Text">{camera.psNo}</Text>
        </Box>

        <Box>
          <Text fontFamily="Wix Madefor Text" fontWeight="bold">Location</Text>
          <Text fontFamily="Wix Madefor Text">{camera.location}</Text>
        </Box>

        <Box>
          <Text  fontFamily="Wix Madefor Text" fontWeight="bold">Last Live</Text>
          <Text fontFamily="Wix Madefor Text" >{camera.lastSeen}</Text>
        </Box>
        <Box>
          <Text fontFamily="Wix Madefor Text" fontWeight="bold"></Text>
          <Text fontFamily="Wix Madefor Text">{camera.lastSeen}</Text>
        </Box>

        <Box>
          <Text fontFamily="Wix Madefor Text" fontWeight="bold">Video Feed</Text>
          <IconButton
            onClick={() => handleViewCamera(camera)}
            colorScheme="blue"
            size="sm"
            aria-label="View"
            icon={<MdVisibility />}
          />
        </Box>
         <Box justifyContent="right" textAlign="right">
          {editableCameraID === camera.id ? (
            <Button
              onClick={() => handleUpdateClick(camera.deviceId)}
              colorScheme="green"
              size="sm"
            >
              Update
            </Button>
          ) : (
            <Button
              onClick={() => handleDeleteClick(camera.deviceId)}
              colorScheme="red"
              size="sm"
            >
              <MdDelete />
            </Button>
          )}
        </Box>



      </Grid>
    )}
  </Box>
))}


          <h2
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              textAlign: "center", // optional
            }}
          >
            <img width="37px" height="37px" src={logo} alt="Camera Icon" />
            {cameraa.length === 0
              ? "No device added"
              : "Your Installed Camera List"}
          </h2>

          <Modal isOpen={showModal} onClose={handleCloseModal}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                {selectedCamera && (
                  <>
                    <ModalHeader>{selectedCamera.deviceId}</ModalHeader>
                    <ReactPlayer
                      url={selectedCamera.flvUrl}
                      playing={true}
                      controls={true}
                      position="fixed"
                      width="320px"
                      height="197px"
                    />
                    <Flex justifyContent="space-between" mt={4} mb={4}>
                      <Button
                        colorScheme="blue"
                        mt={4}
                        onClick={() =>
                          handleGetData(selectedCamera.deviceId, "flip")
                        }
                      >
                        Flip &nbsp;
                        <LuFlipVertical2 />
                      </Button>
                      <Button
                        colorScheme="blue"
                        mt={4}
                        onClick={() =>
                          handleGetData(selectedCamera.deviceId, "mirror")
                        }
                      >
                        Mirror &nbsp;
                        <LuFlipHorizontal2 />
                      </Button>
                    </Flex>
                  </>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Container
          maxW="98vw"
          height="82vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={4}
          px={{ base: "0", sm: "8" }}
          style={{ margin: "0px" }}
        >
          <Text textAlign="center">
            To access this app, please turn on your 'LOCATION'
          </Text>
        </Container>
      )}
    </Container>
  );
};

export default withAuth(AutoInstaller);
