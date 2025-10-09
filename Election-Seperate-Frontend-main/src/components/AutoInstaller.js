import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import logo from "./images/logo/cam.png";
import Delete from "./images/logo/deleteicon.png";
import { FiList } from "react-icons/fi";
import * as FileSaver from "file-saver";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Filesystem, Directory } from '@capacitor/filesystem';
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
  Tooltip,
  Checkbox,
  border, // Import Checkbox from Chakra UI
  Box,
  Image,
  Grid,
  Collapse,
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
   setIsEdited 
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
  const [isEditing, setIsEditing] = useState(false); // NEW: Editing state
  const [prourl, setProurl] = useState("");

  // NEW STATE VARIABLES
  const [cameraStatus, setCameraStatus] = useState(null);
  const [blurChecked, setBlurChecked] = useState(false);
  const [blackviewChecked, setBlackviewChecked] = useState(false);
  const [brightnessChecked, setBrightnessChecked] = useState(false);
  const [blackAndWhiteChecked, setBlackAndWhiteChecked] = useState(false);
  const [cameraAngleAcceptable, setCameraAngleAcceptable] = useState(true);
  const [hasClickedCameraDidInfo, setHasClickedCameraDidInfo] = useState(false); // Track button click
  const [searchDeviceId, setSearchDeviceId] = useState("");
  const [isFetchingCameraDetails, setIsFetchingCameraDetails] = useState(false); // New state for fetching status

  // useRef to hold the interval ID
  const toastInterval = useRef(null);

  // useRef to hold the interval ID for camera status polling
  const cameraStatusInterval = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const camerasPerPage = 5; // Adjust as needed
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
   const handleBackClick = () => {
    setShowAdditionalInputs(false);
    // Optionally clear any form fields or camera data here if needed
    setDeviceId(""); // Reset DeviceID
    setFlvUrl(""); // Reset video URL
    setCameraStatus(null); // Reset camera status
    setHasClickedCameraDidInfo(false); // Reset this state when adding new device
    clearInterval(cameraStatusInterval.current);
    clearInterval(toastInterval.current);
  };
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
  const filteredCameras = [...cameraa].sort((a, b) => {
    // If searchDeviceId is empty, keep normal order
    if (!searchDeviceId) return 0;

    const aMatch = a.deviceId.includes(searchDeviceId);
    const bMatch = b.deviceId.includes(searchDeviceId);

    // Put matching records at the top
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const handleAddInputs = async () => {
    if (!deviceId) {
      toast.error("Please enter a Device ID first", {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setShowAdditionalInputs(true);
    setHasClickedCameraDidInfo(true); // Button was clicked
    clearInterval(cameraStatusInterval.current);
    clearInterval(toastInterval.current);

    // Start fetching camera details
    setIsFetchingCameraDetails(true);

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
      setIsFetchingCameraDetails(false);
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
      setIsFetchingCameraDetails(false);
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
      setIsFetchingCameraDetails(false);
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
const downloadReport = async () => {
  const exportData = cameraa.map((camera) => ({
    "Device ID": camera.deviceId,
    District: camera.district,
    "Assembly Name": camera.assemblyName,
    "PS No.": camera.psNo,
    Location: camera.location,
    "Last Seen": camera.lastSeen,
    Status: camera.status,
    "Is Edited": camera.isEdited,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Camera Report");

  // Detect if running inside Capacitor native app
  const isNative = window.Capacitor?.isNativePlatform?.();

  if (isNative) {
    // ✅ Native mobile: Save file in app's Documents directory
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    try {
      const result = await Filesystem.writeFile({
        path: 'camera_report.xlsx',
        data: wbout,
        directory: Directory.Documents,
      });
      console.log('✅ Excel report saved to:', result.uri);
      alert('Camera report saved successfully on your device >> Go to files >> Documents');
    } catch (error) {
      console.error('❌ Error saving Excel file:', error);
      alert('Failed to save report.');
    }
  } else {
    // 🌐 Web browser: trigger normal file download
    XLSX.writeFile(wb, 'camera_report.xlsx');
  }
};
  const startCameraStatusPolling = (deviceId) => {
    setCameraStatus(undefined); // Set to undefined when polling starts
    fetchCameraStatus(deviceId);

    cameraStatusInterval.current = setInterval(() => {
      fetchCameraStatus(deviceId);
    }, 15000);
  };

  const fetchCameraStatus = async (deviceId) => {
    const toastStyle = {
      fontSize: "12px", // Smaller font
      padding: "8px 12px", // Reduced padding
      height: "3%",
      width: "80%",
    };
    try {
      const status = await getCameraStatus(deviceId);

      if (status.success === false) {
        console.log("Api status false");
        setCameraStatus(null);
        setIsFetchingCameraDetails(false);
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
        setIsFetchingCameraDetails(false);

  //       if (cameraAngle > 15) {
  //         if (!toastInterval.current) {
  //           toastInterval.current = setInterval(() => {
  //             toast.warn(
  //               "Try to adjust the angle of camera. The angle of camera should be in range of 0-15 degree",
  //               {
  //                 position: "top-right",
  //                 autoClose: 5000,
  //                 hideProgressBar: false,
  //                 closeOnClick: true,
  //                 pauseOnHover: true,
  //                 draggable: true,
  //                 style: toastStyle, // Apply inline styles here
  //               }
  //             );
  //           }, 9000);
  //         }
  //       } else {
  //         clearInterval(toastInterval.current);
  //         toastInterval.current = null;
  //       }
  //     }

  //     if (status.blur) {
  //       toast.warn("Camera is blur, try to fix it!", {
  //         position: "top-right",
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //       });
  //     }
  //     if (status.blackview) {
  //       toast.warn("Camera having black view, try to fix it!", {
  //         position: "top-right",
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //       });
  //     }
  //     if (!status.brightness) {
  //       toast.warn("Check the brightness of the camera!", {
  //         position: "top-right",
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //       });
  //     }
  //     if (status.BlackAndWhite) {
  //       toast.warn("Camera is black and white!", {
  //         position: "top-right",
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //       });
   }
    } catch (error) {
      console.error("Error fetching camera status:", error);
      setIsFetchingCameraDetails(false);
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
        status,
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
        formattedTime,      );

      console.log("response of submit", response);
      camera();
      setState("");
      setDistrict("");
      setAssemblyName("");
      setPsNumber("");
      setExcelLocation("");
      setShowAdditionalInputs(false);
      setIsEditing(false);

      // Call the new API endpoint to update isEdited
      if (isEditing) {
        await setIsEdited(deviceId); // Call the new API function
      }

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

  const handleAddNewDeviceClick = () => {
    setShowAdditionalInputs(true); // Show the inputs
    setHasClickedCameraDidInfo(false); // Reset this state when adding new device
    setCameraStatus(null); // Reset camera status
    setDeviceId(""); // Reset device ID
    setFlvUrl(""); // Reset video URL
  };
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
   const autosuggestRef = useRef(null);

   const handleInputChange = async (event, { newValue, method }) => {
    setDeviceId(newValue);

    if (method === 'type') {
      const numericValue = newValue.replace(/\D/g, '');

      if (numericValue.length === 6) {
        setIsLoading(true);
        try {
          const response = await getFullDid(numericValue);
          setSuggestions(response.streamnames);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }
  };

  const handleSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    setDeviceId(suggestionValue);
    setSuggestions([]); // Clear suggestions after selection
    if (autosuggestRef.current) {
        autosuggestRef.current.input.blur();
    }
  };

  const getSuggestionValue = (suggestion) => suggestion;
  const renderSuggestion = (suggestion) => <div>{suggestion}</div>;

  const inputProps = {
    placeholder: 'Enter Device ID',
    value: deviceId,
    onChange: handleInputChange,
    style: {
      width: '240px',
      height: '35px',
      padding: '10px 14px',
      borderRadius: '8px',
      background: '#fff',
      boxShadow: 'inset 0 1px 2.4px rgba(0, 0, 0, 0.25)',
      color: 'black',
      fontFamily: "'Wix Madefor Text'",
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 'normal',
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

      style={{ margin: "0px", backgroundColor: "#F4F4F5" }}
    >
      <style>{customCSS}</style>
      <ToastContainer />
      <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
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
          {/* Conditional Rendering: Table Content Only if NOT Adding New Device */}
          {!showAdditionalInputs ? (
            <>
              {/* Pagination */}
              <Flex justify="center" mt={4} mb={5}>
                <Box
                  border="1px solid #7EA3C2"
                  borderRadius="10px"
                  display="inline-flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Button
                    onClick={() => handleClick(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    size="sm"
                    mr={2}
                    color="black"
                  >
                    Previous
                  </Button>

                  {pages.map((page) => (
                    <Button
                      key={page}
                      onClick={() => handleClick(page)}
                      size="sm"
                      mx={1}
                      fontFamily="Wix Madefor Text"
                      fontSize="12px"
                      fontWeight="400"
                      color="black"
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    onClick={() => handleClick(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    size="sm"
                    ml={2}
                    color="black"
                  >
                    Next
                  </Button>
                </Box>
              </Flex>

              <h3
                style={{
                  display: "flex",
                  justifyContent: "right",
                  alignItems: "right",
                  gap: "0.5rem",
                  textAlign: "right",
                  // marginBottom: "10px",
                }}
              >
                <Box style={{ textAlign: "left", width: "55%" }}>
                  {" "}
                  {/* Added Box with styling */}
                  <Text
                    style={{
                      fontWeight: "700",
                      fontFamily: "Inter !important",
                      fontSize: "20px",
                      lineHeight: "normal",
                    }}
                  >
                    Devices Added - ({cameraa.length})
                  </Text>
                </Box>
                {!showAdditionalInputs && cameraa.length > 0 && (
                  <Button
                    bg="#F4F4F5"
                    fontSize="15px"
                    height="10px"
                    marginTop="5px"
                    fontFamily="Wix Madefor Text"
                    onClick={downloadReport}
                    leftIcon={<FaFileExcel />}
                  >
                    Excel
                    {/* Download Camera Report (Excel) */}{" "}
                    {/* Commented out the text label */}
                  </Button>
                )}
                <Text
                  fontWeight="400"
                  fontFamily="Wix Madefor Text"
                  fontSize="13px"
                  textDecoration="underline"
                  textUnderlineOffset="2px"
                  textDecorationStyle="solid"
                  textDecorationSkipInk="none"
                  textDecorationThickness="auto"
                >
                  Sort by
                </Text>
                <img
                  src={sortIcon}
                  alt="Sort"
                  style={{
                    width: "15px",
                    height: "15px",
                    cursor: "pointer",
                  }}
                  onClick={handleSort}
                />
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "left",
                  marginBottom: "12px",
                }}
              >
                <Input
                  value={searchDeviceId}
                  onChange={(e) => setSearchDeviceId(e.target.value)}
                  placeholder="Search Device ID"
                  style={{
                    width: "70%",
                    height: "35px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#fff",
                    boxShadow: "inset 0 1px 2.4px rgba(0, 0, 0, 0.25)",
                    color: "black",
                    fontFamily: "'Wix Madefor Text'",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                />
                <Button
onClick={refresh}
  sx={{
    marginTop: "10px",
    background: "#F4F4F5",
    height: "35px",
    fontFamily: "'Wix Madefor Text', sans-serif",
    fontSize: "15px",
    fontStyle: "normal",
    fontWeight: "400",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    color: "black",
    _hover: {
      background: "#E4E4E5",
      textDecoration: "underline",
    },
  }}
                >
                  <IoIosRefresh color="#3F77A5" />
                  &nbsp;Refresh
                </Button>
              </div>
              {/* Camera List Table */}
              {filteredCameras
                .slice(startIndex, endIndex)
                .map((camera, index) => (
                  <Box
                    key={camera.deviceId}
                    sx={{
                      borderTop: index === 0 ? "2px solid #3F77A5" : "none", // top border only for first
                      borderBottom:
                        index !==
                        filteredCameras.slice(startIndex, endIndex).length - 1
                          ? "2px solid #3F77A5"
                          : "none", // bottom border for all except last
                      pb: 2,
                    }}
                    mb={4}
                    p={4}
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <Box>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontFamily: "Wix Madefor Text !important",
                            fontSize: "15px",
                            lineHeight: "24px",
                            fontStyle: "normal",
                            color: "#1A1A1A",
                          }}
                        >
                          Device ID: {camera.deviceId}
                        </Text>
                      </Box>

                      <Box>
                        <Text>{camera.status === "RUNNING" ? "🟢" : "🔴"}</Text>
                      </Box>
                      <Box
                        width="0"
                        height="18px"
                        flexShrink={0}
                        borderLeft="1px solid #1A1A1A"
                      />
                      <IconButton
                        aria-label="Expand/Collapse Details"
                        icon={
                          <Image
                            src={expand}
                            onClick={() => handleToggleExpand(camera.deviceId)}
                            alt="Expand"
                            sx={{
                              transform:
                                expandedCameraId === camera.id
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        }
                      />
                    </Flex>

                    {expandedCameraId === camera.deviceId && (
                      <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={2}>
                        <Box>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            District
                          </Text>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            {camera.district}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            Assembly Name
                          </Text>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            {camera.assemblyName}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            PS No.
                          </Text>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            {camera.psNo}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            Location
                          </Text>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            {camera.location}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            Last Live
                          </Text>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            {camera.lastSeen}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          ></Text>
                          <Text
                            style={{
                              fontWeight: "400",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            {camera.lastSeen}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontFamily: "Wix Madefor Text !important",
                              fontSize: "14px",
                              lineHeight: "24px",
                              fontStyle: "normal",
                              color: "#1A1A1A",
                            }}
                          >
                            Video Feed
                          </Text>
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
                               <img
    src={Delete}
    alt="Camera Icon"
    width="20px"
    height="20px"
    style={{ objectFit: "contain" }}
  />
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
                  textAlign: "center",
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
                          width="355px"
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
            // Conditional Section: QR, Suggestion, and Camera DID Info
            <>
              {isMobileDevice && (
                <>
                  {" "}
                  <div style={{ textDecoration: "underline" }}>
                    <QRCodeScanner onScanSuccess={handleScanSuccess} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    OR
                  </div>

                <Box display="flex" justifyContent="flex-end" alignItems="center" ml="4px">
      <Tooltip
        label="List View"
        placement="right"
        hasArrow
        bg="#1A1A1A"
        color="white"
        fontFamily="Wix Madefor Text, sans-serif !important"
        fontSize="14px"
        borderRadius="6px"
        p="6px 10px"
        openDelay={100}
      >
        <IconButton
          icon={<FiList size={18} />}
          aria-label="List View"
          onClick={handleBackClick}
          bg="#F4F4F5"
          border="1px solid #DADADA"
          boxShadow="0px 1px 4px rgba(0,0,0,0.1)"
          borderRadius="8px"
          height="36px"
          width="4px"
          color="#1A1A1A"
          transition="all 0.25s ease"
         
        />
      </Tooltip>
    </Box>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap:"10px"
                }}
              >
                {/* <Text style={{ width: "120px" }}>DeviceID</Text> */}
                {suggestions && suggestions.length >= 0 ? (
                   <Autosuggest
      ref={autosuggestRef}
      suggestions={suggestions}
      onSuggestionsFetchRequested={({ value, reason }) => {
        if (reason === 'input-changed') {
          handleInputChange(null, { newValue: value, method: 'type' });
        }
      }}
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      onSuggestionSelected={handleSuggestionSelected}
    />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Text>No Camera Found !</Text>
                    <Button onClick={refresh}>Go Back</Button>
                  </div>
                )}
              </div>

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
                  borderRadius="8px"
                  background="#3F77A5"
                  width="200px"
                  height="35px"
                  marginBottom="5px"
                  color="white"
                  onClick={handleAddInputs}
                >
                  Camera DID Info
                </Button>

              </div>
            </>
          )}

          {!showAdditionalInputs ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                 marginBottom:"50px"
              }}
            >
              <Button
                display="flex"
                justifyContent="center"
                alignItems="center"
                borderRadius="8px"
                background="#3F77A5"
                width="200px"
                height="40px"
                color="white"
                marginTop="15px"
               
                onClick={handleAddNewDeviceClick}
              >
                Add New device
              </Button>
            </div>
          ) : (
            <>
              {/* Conditional Section: Add New Device Section */}

              {/* Video Player - Only show if we have a URL */}
              {flvUrl && (
                <ReactPlayer
                  url={flvUrl}
                  playing={true}
                  controls={true}
                  width="100%"
                  height="50%"
                  style={{ marginBottom: "1rem" }}
                />
              )}

              {/* DIV 1: Camera Technical Parameters - Only show after Camera DID Info is clicked */}
              {hasClickedCameraDidInfo && (
                <Box mb={4}>
                  {isFetchingCameraDetails ? (
                    // Show loading state
                    <Flex
                      align="center"
                      justifyContent="center"
                      marginBottom="1.5rem"
                      padding="0.5rem"
                      border="1px solid #E2E8F0"
                      borderRadius="md"
                      bg="blue.50"
                      color="blue.600"
                    >
                      <Text fontWeight="bold" marginRight="0.5rem">
                        Fetching Camera Details...
                      </Text>
                      <Text>Please Wait...</Text>
                    </Flex>
                  ) : cameraStatus ? (
                    // Show camera technical parameters when available
                    <>
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
                        <Text
                          marginRight="0.5rem"
                          fontFamily="Wix Madefor Text"
                        >
                          Resolution:
                        </Text>
                        <Text marginRight="1rem" fontFamily="Wix Madefor Text">
                          {cameraStatus.resolution}
                        </Text>

                        <Text
                          marginRight="0.5rem"
                          fontFamily="Wix Madefor Text"
                        >
                          Camera Angle:
                        </Text>
                        <Text marginRight="1rem" fontFamily="Wix Madefor Text">
                          {Math.abs(cameraStatus.camera_angle)}
                        </Text>

                        <Text
                          marginRight="0.5rem"
                          fontFamily="Wix Madefor Text"
                        >
                          FPS:
                        </Text>
                        <Text marginRight="1rem" fontFamily="Wix Madefor Text">
                          {cameraStatus.fps}{" "}
                        </Text>
                      </Flex>

                      {/* Camera Status Checkboxes */}
                      <Flex
                        wrap="wrap"
                        gap="0.1rem"
                        mt="1.5rem"
                        mb="1.5rem"
                        px="0.5rem"
                      >
                        {[
                          {
                            label: blurChecked ? "Blur" : "No Blur",
                            checked: !blurChecked,
                          },
                          {
                            label: blackviewChecked
                              ? "Black View"
                              : "No Black View",
                            checked: !blackviewChecked,
                          },
                          { label: "Brightness", checked: brightnessChecked },
                          {
                            label: blackAndWhiteChecked
                              ? "Black & White"
                              : "No Black & White",
                            checked: !blackAndWhiteChecked,
                          },
                          {
                            label: cameraAngleAcceptable
                              ? "Camera Angle OK"
                              : "Camera Angle Issue",
                            checked: cameraAngleAcceptable,
                          },
                        ].map(({ label, checked }, index) => (
                          <Flex
                            key={index}
                            direction="column"
                            align="center"
                            gap="0.3rem"
                            width="66px"
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
                    </>
                  ) : (
                    // Show not available state
                    <Flex
                      align="center"
                      justifyContent="center"
                      marginBottom="1.5rem"
                      padding="0.5rem"
                      border="1px solid #E2E8F0"
                      borderRadius="md"
                      bg="red.100"
                      color="gray.600"
                    >
                      <Text>Fetching Camera Configuration Details...</Text>
                    </Flex>
                  )}
                </Box>
              )}

              {/* DIV 2: Camera Location Details - Only show after Camera DID Info is clicked */}
             {hasClickedCameraDidInfo && (
  <Box>
   <h1
  style={{
    fontSize: "14px",
    fontFamily: '"Wix Madefor Text", sans-serif',
    fontWeight: 500,
    fontStyle: "normal",
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

    {/* Location Details Form */}
<Box padding="10px">
  {/* State */}
  <Box marginBottom="0.75rem">
    <Text
      width="100%"
      fontWeight="600"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="14px"
      color="#1A1A1A"
      marginBottom="4px"
    >
      &nbsp; State
    </Text>
    <Input
      background="#FFF"
      fontWeight="500"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="12px"
      value={state}
      onChange={(e) => setState(e.target.value.toUpperCase())}
      placeholder="State"
      isReadOnly={true}
    />
  </Box>

  {/* District */}
  <Box marginBottom="0.75rem">
    <Text
     width="100%"
      fontWeight="600"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="14px"
      color="#1A1A1A"
      marginBottom="4px"
    >
      &nbsp; District
    </Text>
    <Input
      background="#FFF"
      fontWeight="500"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="12px"
      value={district}
      onChange={(e) => setDistrict(e.target.value)}
      placeholder="District"
      isReadOnly={!isEditing}
    />
  </Box>

  {/* Assembly */}
  <Box marginBottom="0.75rem">
    <Text
      width="100%"
      fontWeight="600"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="14px"
      color="#1A1A1A"
      marginBottom="4px"
    >
      &nbsp; Assembly
    </Text>
    <Input
      background="#FFF"
      fontWeight="500"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="12px"
      value={assemblyName}
      onChange={(e) => setAssemblyName(e.target.value)}
      placeholder="Assembly Name"
      isReadOnly={!isEditing}
    />
  </Box>

  {/* PsNo */}
  <Box marginBottom="0.75rem">
    <Text
      width="100%"
      fontWeight="600"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="14px"
      color="#1A1A1A"
      marginBottom="4px"
    >
      &nbsp; PsNo.
    </Text>
    <Input
      background="#FFF"
      fontWeight="500"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="12px"
      value={psNumber}
      onChange={(e) => setPsNumber(e.target.value)}
      placeholder="PS Number"
      isReadOnly={!isEditing}
    />
  </Box>

  {/* Location */}
  <Box marginBottom="0.75rem">
    <Text
     width="100%"
      fontWeight="600"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="14px"
      color="#1A1A1A"
      marginBottom="4px"
    >
      &nbsp; Location
    </Text>
    <Input
      background="#FFF"
      fontWeight="500"
      fontFamily="'Wix Madefor Text', sans-serif"
      fontSize="12px"
      value={excelLocation}
      onChange={(e) => setExcelLocation(e.target.value)}
      placeholder="Location"
      isReadOnly={!isEditing}
    />
  </Box>
</Box>


    <Flex justifyContent="center" alignItems="center" gap="20px">
        { !isEditing ? (
          <Button
            background="#3F77A5"
            color="white"
            onClick={() => setIsEditing(true)} // Set isEditing to true on "Edit"
            width="120px"
            height="40px"
            borderRadius="8px"
            marginRight="10px"
             marginBottom="50px"
          >
            Edit
          </Button>
        ) : (
          <Button
            colorScheme="gray"
            onClick={() => {
              setIsEditing(false);
            }}
            width="120px"
            height="40px"
            borderRadius="8px"
            marginBottom="50px"
          >
            Cancel
          </Button>
        )}

      <Button
        background="#3F77A5"
        color="white"
        onClick={handleSubmit} // Submit - isEdited is determined by the state
        width="120px"
        height="40px"
        borderRadius="8px"
         marginBottom="50px"
      >
        Submit
      </Button>
    </Flex>
  </Box>
)}
            </>
          )}
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
