import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./auto-installer.css";
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
  Checkbox, // Import Checkbox from Chakra UI
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
import { Link } from "react-router-dom";

const AutoInstaller = () => {
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

  // useRef to hold the interval ID
  const toastInterval = useRef(null);

  // useRef to hold the interval ID for camera status polling
  const cameraStatusInterval = useRef(null);

  useEffect(() => {
    camera();
    did();

    // toast.success('Welcome', {
    //   position: 'top-right',
    //   autoClose: 1500, // 5 seconds
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,

    //   draggable: true,
    // });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Get latitude and longitude from the position object
          const { latitude, longitude } = position.coords;

          // const latitude = 23.0282826;
          // const longitude = 72.5398852;
          setLatie(latitude);
          setLongie(longitude);

          // Set the location in state
          setLocation({ latitude, longitude });

          // Fetch the city and state using OpenCage Geocoding API
          try {
            // This part is incomplete; you need to provide the API endpoint and parameters
            // const response = await axios.get(
            //   // Provide your API endpoint and parameters here
            //   `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=e2d4a93e63e344a8a223f8a41ced79c3`
            // );

            const responsee = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBNBVfpAQqikexY-8J0QDyBR4bWKiKe7OA`
            );
            setAddress(responsee.data.results[0].formatted_address);
            setStateu(
              responsee.data.plus_code.compound_code.split(",")[1].toUpperCase()
            );

            // if (response.data.results && response.data.results.length > 0) {
            //   const city = response.data.results[0].components.suburb;
            //   const state = response.data.results[0].components.state_district;
            //   const district = response.data.results[0].components.state_district;
            //   // setAddress(`${city}, ${district}, ${state}`);
            //   console.log("locationnnnnnn", response.data.results[0].components.state)
            // }
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

    // Clear the interval when the component unmounts
    return () => {
      console.log(
        "AutoInstaller component unmounting OR deviceId changed. Clearing intervals."
      );
      clearInterval(toastInterval.current);
      clearInterval(cameraStatusInterval.current); // Clear the camera status interval
    };
  }, [deviceId]); // Empty dependency array to run the effect only once

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

  // const handleGetData = async (deviceId) => {
  //   const response = await getCameraByDid(deviceId);
  //   // setProurl(`tcp://${response.flvUrl.prourl}`);
  //   // console.log(deviceId, `tcp://${response.flvUrl.prourl}`);
  //   const getset = await getSetting(deviceId, response.flvUrl.prourl);
  //   console.log("getSetting", getset.data.appSettings.imageCfg);

  //   const modifiedData = { ...getset.data.appSettings.imageCfg };
  //       modifiedData.flip = modifiedData.flip === 1 ? 0 : 1;

  //       console.log("Modified data:", modifiedData);
  // }

  const handleAddInputs = async () => {
    setShowAdditionalInputs(true);
    clearInterval(cameraStatusInterval.current); // Clear existing interval
    clearInterval(toastInterval.current); // Clear existing interval
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

    // Call the function to send the URL to the external API
    sendUrlToExternalApi(response.flvUrl.url2);

    //NEW: Get Camera Status and setup polling
    startCameraStatusPolling(deviceId);
  };

  const startCameraStatusPolling = (deviceId) => {
    // Fetch camera status immediately when starting
    fetchCameraStatus(deviceId);

    // Set up an interval to fetch the camera status periodically (e.g., every 5 seconds)
    cameraStatusInterval.current = setInterval(() => {
      fetchCameraStatus(deviceId);
    }, 15000); // Adjust the interval as needed
  };

  const fetchCameraStatus = async (deviceId) => {
    try {
      const status = await getCameraStatus(deviceId);

      if (status.success === false) {
        // console.log("Api status false");
        setCameraStatus(null); // Set state to null to indicate no data
        return;
      } else {
        console.log("Api status true");
        setCameraStatus(status);
        setBlurChecked(status.blur);
        setBlackviewChecked(status.blackview);
        setBrightnessChecked(status.brightness);
        setBlackAndWhiteChecked(status.BlackAndWhite);

        // Handle Camera Angle and Toast
        const cameraAngle = Math.abs(status.camera_angle);
        if (cameraAngle > 15) {
          if (!toastInterval.current) {
            //     // Show toast immediately
            //     toast.warn("Try to adjust the angle of camera. The angle of camera should be in range of 0-15 degree", {
            //         position: "top-right",
            //         autoClose: 5000,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //     });

            // Set interval to show toast every 15 seconds
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
                }
              );
            }, 9000); // 15000 milliseconds = 15 seconds
          }
        } else {
          // If the angle is proper, clear any existing interval
          clearInterval(toastInterval.current);
          toastInterval.current = null;
        }
      }

      // NEW: Check for blur, blackview, brightness, and blackAndWhite after setting state
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
      // Handle the error as needed (e.g., display an error message)
    }
  };

  const sendUrlToExternalApi = async (url2) => {
    try {
      // Transform the URL and replace "https" with "rtmp"
      let rtmpUrl = url2.replace("https", "rtmp");

      // Extract the hostname from the URL
      const url = new URL(rtmpUrl);
      const hostname = url.hostname;

      // Check if the hostname contains a port number
      if (!hostname.includes(":")) {
        // Add the port number to the hostname in the transformed URL
        rtmpUrl = rtmpUrl.replace(hostname, `${hostname}:80`);
      }

      rtmpUrl = rtmpUrl.replace(".flv", "");

      console.log("Transformed URL:", rtmpUrl);

      // Prepare the data for the POST request
      const postData = { rtmp: rtmpUrl };
      console.log("My data is", postData);

      // Make the POST request to the external API
      const response = await axios.post(
        "http://4.213.225.23:8000/analyze-camera",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("External API Response:", response.data);
      // Handle the response from the external API as needed
      toast.success("Successfully triggered external API", {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error sending URL to external API:", error);
      // Handle errors as needed
      // toast.error('Failed to trigger external API', {
      //     position: 'top-right',
      //     autoClose: 3500,
      //     hideProgressBar: false,
      //     closeOnClick: true,
      //     pauseOnHover: true,
      //     draggable: true,
      // });
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
        installed_status
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

  const [cameraa, setCameraa] = useState([]);
  const camera = async () => {
    try {
      const mobile = localStorage.getItem("mobile");
      const result = await getCamera(mobile);
      console.log("cameras data", result.data);
      setCameraa(result.data);
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
      width: "100%",
      padding: "10px",
      borderColor: "black",
      borderWidth: "1px",
    },
  };

  return (
    <Container
      maxW="98vw"
      p={4}
      px={{ base: "0", sm: "8" }}
      style={{ margin: "0px" }}
    >
      {" "}
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
      >
        <Button onClick={refresh}>
          <IoIosRefresh />
          &nbsp;Refresh
        </Button>
      </div>
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
            }}
          >
            <Text style={{ width: "120px" }}>DeviceID</Text>

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
                height="400px"
                style={{ marginBottom: "1rem" }} // Add spacing below the video
              />

              {/* Camera Status Information (Inline Horizontal) */}
              {cameraStatus ? ( // Conditional rendering
                <Flex
                  direction="row"
                  align="center"
                  flexWrap="wrap"
                  marginBottom="1.5rem"
                  padding="0.5rem"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Text fontWeight="bold" marginRight="0.5rem">
                    Resolution:
                  </Text>
                  <Text marginRight="1rem">{cameraStatus.resolution}</Text>

                  <Text fontWeight="bold" marginRight="0.5rem">
                    FPS:
                  </Text>
                  <Text marginRight="1rem">{cameraStatus.fps}</Text>

                  <Text fontWeight="bold" marginRight="0.5rem">
                    Camera Angle:
                  </Text>
                  <Text marginRight="1rem">
                    {Math.abs(cameraStatus.camera_angle)}{" "}
                    {/* Display absolute value */}
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
                  bg="red.100" // Light red background
                  color="red.600" // Darker red text
                >
                  <Text fontWeight="bold" marginRight="0.5rem">
                    Fetching Camera Status...
                  </Text>
                  <Text>Please Wait...</Text>
                </Flex>
              )}
              {/*NEW: Checkboxes (Read-Only, Horizontal) */}
              {cameraStatus ? (
                <Flex
                  spacing={5}
                  direction="row"
                  align="center"
                  marginBottom="1.5rem"
                  padding="0.5rem"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Checkbox
                    isChecked={!blurChecked}
                    isReadOnly
                    marginRight="1rem"
                  >
                    No Blur
                  </Checkbox>
                  <Checkbox
                    isChecked={!blackviewChecked}
                    isReadOnly
                    marginRight="1rem"
                  >
                    No Blackview
                  </Checkbox>
                  <Checkbox
                    isChecked={brightnessChecked}
                    isReadOnly
                    marginRight="1rem"
                  >
                    Brightness
                  </Checkbox>
                  <Checkbox isChecked={!blackAndWhiteChecked} isReadOnly>
                    No Black and White
                  </Checkbox>
                </Flex>
              ) : null}

              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <Text style={{ width: "120px",fontWeight: "bold" }}>State</Text>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="district"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
               <Text style={{ width: "120px", fontWeight: "bold" }}>District</Text>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="district"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <Text style={{ width: "120px",fontWeight: "bold" }}>Assembly</Text>
                <Input
                  value={assemblyName}
                  onChange={(e) => setAssemblyName(e.target.value)}
                  placeholder="assemblyName"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <Text style={{ width: "120px",fontWeight: "bold" }}>PsNo.</Text>
                <Input
                  value={psNumber}
                  onChange={(e) => setPsNumber(e.target.value)}
                  placeholder="psNumber"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <Text style={{ width: "120px" , fontWeight: "bold"}}>Location</Text>
                <Input
                  value={excelLocation}
                  onChange={(e) => setExcelLocation(e.target.value)}
                  placeholder="excelLocation"
                />
              </div>
            </>
          )}
          {!showAdditionalInputs ? (
            <Button mt={4} onClick={handleAddInputs}>
              Camera DID Info
            </Button>
          ) : (
            <>
              <Button onClick={handleSubmit}>Submit</Button>
            </>
          )}

          <br />
          <br />
          <br />
          <TableContainer w={"full"}>
            <Table
              variant="striped"
              colorScheme="teal"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <TableCaption>Your Installed Camera List</TableCaption>
              <Thead>
                <Tr>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    Sr.No.
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    Device ID
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    live
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    Assembly Name
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    Location
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    District
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    Ps No.
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    last Live
                  </Th>
                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    Video Feed
                  </Th>

                  <Th
                    borderRight="1px"
                    borderColor="gray.300"
                    bgColor="black"
                    color="white"
                  >
                    Edit/Delete
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {cameraa.map((camera, index) => (
                  <Tr
                    key={camera.id}
                    bg={index % 2 === 0 ? "gray.100" : "white"}
                  >
                    <Td borderRight="1px" borderColor="gray.300">
                      {index + 1}
                    </Td>
                    <Td borderRight="1px" borderColor="gray.300">
                      {camera.deviceId}
                    </Td>

                    <Td borderRight="1px" borderColor="gray.300">
                      {camera.status === "RUNNING" ? (
                        <span>🟢</span>
                      ) : (
                        <span>🔴</span>
                      )}
                    </Td>

                    <Td borderRight="1px" borderColor="gray.300">
                      {camera.assemblyName}
                    </Td>
                    <Td borderRight="1px" borderColor="gray.300">
                      {camera.location}
                    </Td>
                    <Td borderRight="1px" borderColor="gray.300">
                      {camera.district}
                    </Td>
                    <Td borderRight="1px" borderColor="gray.300">
                      {camera.psNo}
                    </Td>
                    <Td borderRight="1px" borderColor="gray.300">
                      {camera.lastSeen}
                    </Td>

                    <Td borderRight="1px" borderColor="gray.300">
                      {" "}
                      <IconButton
                        marginLeft={2}
                        marginRight={2}
                        onClick={() => handleViewCamera(camera)}
                        colorScheme="blue"
                        style={{ padding: 0, transform: "scale(0.8)" }}
                        aria-label="View details"
                      >
                        <MdVisibility />
                      </IconButton>{" "}
                    </Td>

                    <Td borderRight="1px" borderColor="gray.300">
                      {editableCameraID === camera.id ? (
                        <Button
                          onClick={() => handleUpdateClick(camera.deviceId)}
                          colorScheme="green"
                        >
                          Update
                        </Button>
                      ) : (
                        <>
                          <div style={{ display: "flex" }}>
                            <Button
                              onClick={() => handleDeleteClick(camera.deviceId)}
                              colorScheme="red"
                              style={{ padding: 0 }}
                            >
                              <MdDelete style={{ color: "rgb(200,0,0)" }} />
                            </Button>
                          </div>
                        </>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

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
                      width="100%"
                      height="400px"
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
