import React, { useEffect, useState } from "react";
import {
	Box,
	Typography,
	Paper,
	Avatar,
	Button,
	Grid,
	Rating,
	Chip,
	InputAdornment,
	TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { app, database } from "../../firebase";

const providers = [
	{
		id: 1,
		name: "Alex Johnson",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
		skills: ["Plumbing", "Leak Repair", "Pipe Installation"],
		rating: 4.8,
		reviews: 42,
		bio: "Experienced plumber with 10+ years in residential and commercial services.",
	},
	{
		id: 2,
		name: "Maria Gomez",
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
		skills: ["Painting", "Interior Design"],
		rating: 4.9,
		reviews: 31,
		bio: "Professional painter specializing in interiors and creative finishes.",
	},
	{
		id: 3,
		name: "Samir Patel",
		avatar: "https://randomuser.me/api/portraits/men/85.jpg",
		skills: ["Electrical", "Lighting", "Wiring"],
		rating: 4.7,
		reviews: 28,
		bio: "Certified electrician for all your home and office needs.",
	},
	{
		id: 4,
		name: "Linda Chen",
		avatar: "https://randomuser.me/api/portraits/women/65.jpg",
		skills: ["Cleaning", "Deep Cleaning", "Move-out Cleaning"],
		rating: 4.6,
		reviews: 19,
		bio: "Reliable cleaner with attention to detail and flexible scheduling.",
	},
	{
		id: 5,
		name: "Omar Farouk",
		avatar: "https://randomuser.me/api/portraits/men/77.jpg",
		skills: ["Carpentry", "Furniture Assembly"],
		rating: 4.8,
		reviews: 22,
		bio: "Skilled carpenter for custom furniture and repairs.",
	},
];

export default function ProvidersPage() {
	const [search, setSearch] = useState("");
	const [filteredProviders, setFilteredProviders] = useState<any[]>(providers);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(false);
	}, []);

	useEffect(() => {
		const results = providers.filter(
			(p) =>
				p.name.toLowerCase().includes(search.toLowerCase()) ||
				(Array.isArray(p.skills) && p.skills.some((skill: string) => skill.toLowerCase().includes(search.toLowerCase())))
		);
		setFilteredProviders(results);
	}, [search]);

	return (
		<Box sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 2 }}>
			<br />
			<Box mb={3}>
				<TextField
					fullWidth
					placeholder="Search by name or skill..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
					sx={theme => ({
						background: theme.palette.mode === 'dark' ? '#23272f' : '#fff',
						borderRadius: 2,
						'& .MuiInputBase-input': {
							color: theme.palette.mode === 'dark' ? '#fff' : '#23272f',
						},
						'& .MuiInputBase-root': {
							color: theme.palette.mode === 'dark' ? '#fff' : '#23272f',
						},
					})}
				/>
			</Box>
			{loading ? (
				<Typography>Loading providers...</Typography>
			) : (
				<Grid container spacing={3}>
					{filteredProviders.map((provider) => (
						<Grid key={provider.id} style={{ width: '100%' }}>
							<Paper
								sx={{
								p: 3,
								display: "flex",
								alignItems: "center",
								gap: 3,
								borderRadius: 3,
								boxShadow: 2,
								height: 210,
								minHeight: 210,
								width: '100%',
							}}
							>
								<Avatar
									src={provider.avatar}
									alt={provider.name}
									sx={{ width: 64, height: 64 }}
								/>
								<Box flex={1}>
									<Typography variant="h6" fontWeight={600}>
										{provider.name}
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
										<Rating value={provider.rating} precision={0.1} readOnly size="small" />
										<Typography variant="body2" color="text.secondary">
											{provider.rating} ({provider.reviews} reviews)
										</Typography>
									</Box>
									<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
										{Array.isArray(provider.skills) && provider.skills.map((skill: string) => (
											<Chip key={skill} label={skill} size="small" color="primary" variant="outlined" />
										))}
									</Box>
									<Typography variant="body2" color="text.secondary" mb={1}>
										{provider.bio}
									</Typography>
									<Button variant="contained" size="small" sx={{ mt: 1, borderRadius: 2 }}>
										View Profile
									</Button>
								</Box>
							</Paper>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	);
}
