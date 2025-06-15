import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    TextField,
} from "@mui/material";
import { useAppSelector } from "@store/hooks";
import { useNavigate } from "react-router-dom";

export default function TokenPurchase() {
    const user = useAppSelector((state) => state.user);
    const navigate = useNavigate();

    if (!user?.userType) return <Typography>Loading…</Typography>;

    const pricing = {
        consumer: [
            { tokens: 1, price: 100 },
            { tokens: 20, price: 1800 },
            { tokens: 50, price: 4000 },
        ],
        provider: [
            { tokens: 1, price: 150 },
            { tokens: 20, price: 2800 },
            { tokens: 50, price: 6500 },
        ],
    };

    const packages = user.userType === "provider" ? pricing.provider : pricing.consumer;

    const [quantities, setQuantities] = useState<number[]>(
        Array(packages.length).fill(1)
    );

    const handleQuantityChange = (index: number, value: string) => {
        const num = parseInt(value, 10);
        const updated = [...quantities];
        updated[index] = isNaN(num) || num <= 0 ? 1 : num;
        setQuantities(updated);
    };

    const handlePurchase = (tokens: number, price: number, quantity: number) => {
        const totalTokens = tokens * quantity;
        const totalPrice = price * quantity;

        console.log(`Purchasing ${totalTokens} tokens for ${totalPrice} LKR`);
        // TODO: Trigger payment flow and backend sync here

        // navigate("/dashboard/confirmation");
    };

    return (
        <Box sx={{ mt: { xs: 7, sm: 8 }, px: 2 }}>
            <Typography variant="h4" gutterBottom>
                Buy Platform Tokens
            </Typography>

            <Grid container spacing={3} mt={2}>
                {packages.map(({ tokens, price }, index) => (
                    <Grid key={tokens} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                            <Typography variant="h6" gutterBottom>
                                {tokens} Token{tokens > 1 ? "s" : ""}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Unit Price: {price.toLocaleString()} LKR
                            </Typography>

                            <TextField
                                type="number"
                                inputProps={{ min: 1 }}
                                label="Quantity"
                                variant="outlined"
                                size="small"
                                value={quantities[index]}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                sx={{ mt: 1, width: "80px" }}
                            />

                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Total: {(price * quantities[index]).toLocaleString()} LKR
                            </Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() =>
                                    handlePurchase(tokens, price, quantities[index])
                                }
                            >
                                Buy {quantities[index] * tokens} Tokens
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
