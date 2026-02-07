import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import MapPicker from "../components/MapPicker.jsx";
import WallNav from "../components/WallNav.jsx";

const emptyForm = {
  description: "",
  locationText: "",
  locationLat: null,
  locationLng: null,
  image: null
};

const UserDashboard = () => {
  const location = useLocation();
  const imageInputRef = useRef(null);
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (location.hash === "#complaint") {
      const target = document.getElementById("complaint-form");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await fetch("/api/gallery?max=1");
        if (!response.ok) {
          return;
        }
        const text = await response.text();
        if (!text) {
          return;
        }
        const data = JSON.parse(text);
        setTotalCount(data.totalCount || 0);
      } catch (error) {
        setTotalCount(0);
      }
    };
    loadCount();
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      if (!formData.image || !formData.locationLat || !formData.locationLng) {
        throw new Error("Image and pinned location are required");
      }
      const payload = new FormData();
      payload.append("description", formData.description);
      payload.append("locationText", formData.locationText);
      payload.append("locationLat", formData.locationLat);
      payload.append("locationLng", formData.locationLng);
      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit");
      }

      await response.json();
      setFormData(emptyForm);
      setErrorMessage("");
      setStatus("success");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Submission failed. Try again.");
    }
  };

  return (
    <div className="list">
      <WallNav totalCount={totalCount} onHome={() => window.location.assign("/")} />
      <div className="card complaint-card" id="complaint-form">
        <h2 className="section-title">File a complaint</h2>
        <form className="complaint-form" onSubmit={handleSubmit}>
          <div className="form-control">
            <span>Upload image</span>
            <label className="file-input">
              <input
                ref={imageInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
              <span className="file-button">Choose image</span>
              <span className="file-name">
                {formData.image ? formData.image.name : "No file selected"}
              </span>
            </label>
          </div>
          <div className="form-control">
            <span>Pin location on map</span>
            <MapPicker
              value={{
                lat: formData.locationLat,
                lng: formData.locationLng,
                text: formData.locationText
              }}
              onChange={(location) =>
                setFormData((prev) => ({
                  ...prev,
                  locationLat: location.lat,
                  locationLng: location.lng,
                  locationText: location.text
                }))
              }
            />
          </div>
          <label className="form-control">
            Description (optional)
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </label>
          <button className="button" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit complaint"}
          </button>
          {status === "success" && <p className="success-text">Complaint submitted successfully.</p>}
          {status === "error" && <p className="error-text">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserDashboard;
