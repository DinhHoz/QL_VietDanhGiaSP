// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    Paper,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    CircularProgress,
    Alert
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getImageUrl } from '../utils/api';
import { getCart } from '../utils/cart'; // Import getCart to handle page refresh
import api from '../utils/api';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [cart, setCart] = useState(location.state?.cart || null);
    const [loadingCart, setLoadingCart] = useState(!location.state?.cart);
    const [processingOrder, setProcessingOrder] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        phone: '',
        address: '',
        note: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');

    // Load cart if not passed via state (e.g., user refreshed the page)
    useEffect(() => {
        const fetchCart = async () => {
            if (!cart) {
                const result = await getCart();
                if (result.success && result.data.cart.items.length > 0) {
                    setCart(result.data.cart);
                } else {
                    // Empty cart or error -> redirect
                    navigate('/cart');
                }
                setLoadingCart(false);
            }
        };
        fetchCart();
    }, [cart, navigate]);

    const handleChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handleOrder = async (e) => {
        // 1. Validate Form
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (!shippingInfo.fullName.trim() || !shippingInfo.phone.trim() || !shippingInfo.address.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu thông tin',
                text: 'Vui lòng điền đầy đủ Tên, Số điện thoại và Địa chỉ nhận hàng.',
                confirmButtonColor: '#272624ff',
            });
            return;
        }

        setProcessingOrder(true);

        // 2. Simulate API Call
        try {
            // --- REAL API CALL HERE ---
            console.log(123);
            const orderData = {
                items: cart.items,
                totalPrice: cart.totalPrice,
                shippingInfo,
                paymentMethod
            };
            console.log(12345);
            const res = await api.post('/orders/create', orderData);

            console.log(12388978);
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Success
            Swal.fire({
                icon: 'success',
                title: 'Đặt hàng thành công!',
                text: 'Đơn hàng của bạn đang được xử lý.',
                confirmButtonColor: '#000',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    // navigate('/order-success'); // Create this page later
                    navigate('/'); // Temporary: Go home
                }
            });

        } catch (error) {
            console.error(" LỖI NGHIÊM TRỌNG:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.',
            });
        } finally {
            setProcessingOrder(false);
        }
    };

    if (loadingCart) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress sx={{ color: '#ff9800' }} />
            </Box>
        );
    }

    if (!cart) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                <PaymentIcon fontSize="large" sx={{ color: '#ff9800' }} /> Thanh Toán
            </Typography>

            <Grid container spacing={4}>
                {/* LEFT COLUMN: FORMS */}
                <Grid item xs={12} md={7}>

                    {/* 1. Shipping Info */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShippingIcon /> Thông tin giao hàng
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Họ và tên"
                                    name="fullName"
                                    variant="outlined"
                                    value={shippingInfo.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Số điện thoại"
                                    name="phone"
                                    variant="outlined"
                                    value={shippingInfo.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Địa chỉ nhận hàng"
                                    name="address"
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    value={shippingInfo.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Ghi chú (Tùy chọn)"
                                    name="note"
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    value={shippingInfo.note}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* 2. Payment Method */}
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PaymentIcon /> Phương thức thanh toán
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                                name="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <Paper variant="outlined" sx={{ mb: 1, p: 1, borderColor: paymentMethod === 'cod' ? '#ff9800' : 'rgba(0, 0, 0, 0.12)' }}>
                                    <FormControlLabel
                                        value="cod"
                                        control={<Radio sx={{ color: '#ff9800', '&.Mui-checked': { color: '#ff9800' } }} />}
                                        label={<Typography fontWeight={paymentMethod === 'cod' ? 'bold' : 'normal'}>Thanh toán khi nhận hàng (COD)</Typography>}
                                        sx={{ width: '100%', m: 0 }}
                                    />
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 1, borderColor: paymentMethod === 'banking' ? '#ff9800' : 'rgba(0, 0, 0, 0.12)' }}>
                                    <FormControlLabel
                                        value="banking"
                                        control={<Radio sx={{ color: '#ff9800', '&.Mui-checked': { color: '#ff9800' } }} />}
                                        label={<Typography fontWeight={paymentMethod === 'banking' ? 'bold' : 'normal'}>Chuyển khoản ngân hàng (QR Code)</Typography>}
                                        sx={{ width: '100%', m: 0 }}
                                    />
                                </Paper>
                            </RadioGroup>
                        </FormControl>

                        {paymentMethod === 'banking' && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Thông tin tài khoản sẽ được hiển thị sau khi bạn bấm Đặt hàng.
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT COLUMN: SUMMARY */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ position: { md: 'sticky' }, top: 20 }}>
                        <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                            {/* Header */}
                            <Box sx={{ backgroundColor: '#ff9800', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShoppingBagIcon sx={{ color: 'white' }} />
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    Đơn hàng ({cart.totalItems} sản phẩm)
                                </Typography>
                            </Box>

                            {/* List Items */}
                            <Box sx={{ maxHeight: '400px', overflowY: 'auto', p: 2 }}>
                                <List disablePadding>
                                    {cart.items.map((item) => (
                                        <React.Fragment key={item._id}>
                                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        variant="rounded"
                                                        src={getImageUrl(item.product?.images?.[0])}
                                                        sx={{ width: 60, height: 60, mr: 2, border: '1px solid #eee' }}
                                                    >
                                                        Img
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                            {item.product?.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                SL: {item.quantity} x {Number(item.product?.price || 0).toLocaleString()}₫
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold" color="#ff9800">
                                                                {Number((item.product?.price || 0) * item.quantity).toLocaleString()}₫
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider variant="fullWidth" component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>

                            {/* Calculation */}
                            <Box sx={{ p: 2, backgroundColor: '#fafafa', borderTop: '1px solid #eee' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Tạm tính:</Typography>
                                    <Typography variant="body1">{Number(cart.totalPrice).toLocaleString()}₫</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Phí vận chuyển:</Typography>
                                    <Typography variant="body1" color="success.main">Miễn phí</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold">Tổng cộng:</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="#d32f2f">
                                        {Number(cart.totalPrice).toLocaleString()}₫
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={handleOrder}
                                    disabled={processingOrder}
                                    sx={{
                                        backgroundColor: '#000',
                                        color: 'white',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        '&:hover': { backgroundColor: '#333' }
                                    }}
                                >
                                    {processingOrder ? <CircularProgress size={24} color="inherit" /> : 'ĐẶT HÀNG'}
                                </Button>
                            </Box>
                        </Paper>

                        <Button
                            variant="text"
                            fullWidth
                            sx={{ mt: 2, color: '#666' }}
                            onClick={() => navigate('/cart')}
                        >
                            Quay lại giỏ hàng
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Checkout;