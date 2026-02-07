import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WallNav from "../components/WallNav.jsx";
import { apiUrl } from "../lib/api.js";

const Home = () => {
	const navigate = useNavigate();
	const [images, setImages] = useState([]);
	const [status, setStatus] = useState("idle");
	const [totalCount, setTotalCount] = useState(0);

	useEffect(() => {
		const loadImages = async () => {
			setStatus("loading");
			try {
				const response = await fetch(apiUrl("/api/gallery?max=60"));
        console.log("Gallery API response status:", response);
				if (!response.ok) {
					setStatus("error");
					return;
				}
				const text = await response.text();
				if (!text) {
					setStatus("error");
					return;
				}
				const data = JSON.parse(text);
				setImages(data.items || []);
				setTotalCount(data.totalCount || 0);
				setStatus("success");
			} catch (error) {
				setStatus("error");
			}
		};
		loadImages();
	}, []);

	return (
		<section className="wall">
			<WallNav totalCount={totalCount} onHome={() => navigate("/")} />

			<div className="cta-box">
				<p className="cta-title">File a complaint</p>
				{/* <p className="cta-subtitle">Upload a photo, pin the location, and submit.</p> */}
				<button className="button" type="button" onClick={() => navigate("/complaint")}>
					Open complaint form
				</button>
			</div>

			<div className="wall-grid" aria-live="polite">
				{images.map((image) => (
					<div className="wall-tile" key={image.publicId}>
						<img
							className="wall-image"
							src={image.url}
							alt="Civic issue"
							loading="lazy"
						/>
					</div>
				))}
				{status === "error" && (
					<p className="muted">Unable to load gallery right now.</p>
				)}
				{status === "success" && images.length === 0 && (
					<p className="muted">No complaints yet. Be the first to add one.</p>
				)}
			</div>
		</section>
	);
};

export default Home;
