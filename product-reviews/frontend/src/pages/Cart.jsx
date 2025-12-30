// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import {
  DeleteOutline,
  Add,
  Remove,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles';
import { getCart, updateCartItemApi, removeCartItem } from '../utils/cart';
import { getImageUrl } from '../utils/api';


// --- STYLED COMPONENTS ---

// Wrapper để ép font cho toàn bộ trang Cart
const FontWrapper = styled('div')({
  fontFamily: "'Poppins', sans-serif",
  '& .MuiTypography-root': {
    fontFamily: "'Poppins', sans-serif",
  },
  '& .MuiButton-root': {
    fontFamily: "'Poppins', sans-serif",
    textTransform: 'none', // Bỏ viết hoa mặc định của button
  }
});

const CartPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  border: '1px solid #f3f4f6',
  overflow: 'hidden'
}));

const QuantityBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f3f4f6',
  borderRadius: 50,
  padding: '4px',
  width: 'fit-content',
  margin: '0 auto', // Căn giữa box số lượng
}));

const QuantityBtn = styled(IconButton)(({ theme }) => ({
  width: 28,
  height: 28,
  color: '#374151',
  '&:hover': { backgroundColor: '#fff', color: '#2563eb' },
  '&.Mui-disabled': { opacity: 0.3 }
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
  padding: 24,
  borderRadius: 24,
  backgroundColor: '#fff',
  border: '1px solid #f3f4f6',
  position: 'sticky',
  top: 100
}));

const CheckoutButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#111827',
  color: '#fff',
  borderRadius: 50,
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#374151',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  }
}));

// Style chung cho Table Cell để căn giữa theo chiều dọc
const StyledTableCell = styled(TableCell)({
  borderBottom: '1px solid #f3f4f6',
  padding: '16px',
  verticalAlign: 'middle', // Quan trọng: Căn giữa chiều dọc
  fontFamily: "'Poppins', sans-serif",
});

// Style cho Header Table
const HeaderTableCell = styled(StyledTableCell)({
  color: '#6b7280',
  fontWeight: 600,
  fontSize: '0.9rem',
});

// --- MAIN COMPONENT ---

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  // (Giữ nguyên logic loadCart, handleCheckout, handleUpdateQuantity, handleRemoveItem như cũ)
  // ... Paste lại phần logic JS của bạn ở đây nếu chưa có ...
  const loadCart = async (isBackground = false) => {
    if (!isBackground) setInitialLoading(true);
    setError(null);
    try {
      const result = await getCart();
      if (result.success) {
        setCart(result.data.cart);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Lỗi kết nối");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => { loadCart(false); }, []);

  const handleCheckout = () => {
    if (!cart.items || cart.items.length === 0) {
      Swal.fire({ icon: 'info', title: 'Giỏ hàng trống', text: 'Vui lòng thêm sản phẩm' });
      return;
    }
    navigate('/checkout');
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    // Validation client: chặn ngay để đỡ tốn request
    if (newQuantity < 1) return;

    // Bật trạng thái loading cho đúng item đó (UI/UX)
    setUpdatingId(productId);

    try {
      // Gọi API: Hàm này phải khớp với cấu trúc Axios ở mục 1
      const response = await updateCartItemApi(productId, newQuantity);

      // Axios trả về data nằm trong response.data (nếu bạn dùng interceptor thì có thể là response)
      const result = response.data || response;

      if (result.success) {
        // Cập nhật thành công
        // Cách 1: Load lại toàn bộ giỏ (an toàn nhất, đồng bộ nhất)
        await loadCart(true);

        // Cách 2 (Tối ưu UX): Dùng ngay result.cart backend trả về để set state
        // setCart(result.cart); 
      }

    } catch (err) {
      // XỬ LÝ LỖI (Phần này sẽ bắt được lỗi 400 "Kho chỉ còn X sản phẩm")

      const serverMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';

      Swal.fire({
        icon: 'warning',
        title: 'Không thể cập nhật',
        text: serverMessage, // Sẽ hiện: "Xin lỗi, kho chỉ còn 5 sản phẩm."
      });

      // QUAN TRỌNG: Load lại giỏ hàng về số cũ
      // Ví dụ: Đang là 5, bấm lên 6 (kho ko đủ) -> API lỗi -> Phải load lại về 5
      await loadCart(false);

    } finally {
      setUpdatingId(null);
    }
  };
  const handleRemoveItem = async (productId) => {
    const confirm = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: "Sản phẩm sẽ bị xóa khỏi giỏ hàng",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!confirm.isConfirmed) return;
    setUpdatingId(productId);
    try {
      const result = await removeCartItem(productId);
      if (result.success) {
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => item.product._id !== productId)
        }));
        await loadCart(true);
      } else {
        Swal.fire('Lỗi', result.error, 'error');
      }
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể xóa', 'error');
    } finally {
      setUpdatingId(null);
    }
  };


  if (initialLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}><CircularProgress sx={{ color: '#111827' }} /></Box>;
  }

  // --- RENDER ---
  return (
    <FontWrapper>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Header Title */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 650, color: '#111827' }}>
            Thông tin sản phẩm
          </Typography>
          <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 500 }}>
            ({cart.totalItems} sản phẩm)
          </Typography>
        </Box>

        {cart.items && cart.items.length > 0 ? (
          <Grid container spacing={4}>
            {/* LEFT COLUMN: Table */}
            <Grid item xs={12} lg={8}>
              <CartPaper elevation={0}>
                <TableContainer>
                  <Table sx={{ minWidth: 700 }} aria-label="shopping cart table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#fafafa' }}>
                        {/* Căn chỉnh width và align cho Header */}
                        <HeaderTableCell align="left" width="45%" sx={{ pl: 4 }}>Sản phẩm</HeaderTableCell>
                        <HeaderTableCell align="center" width="20%">Đơn giá</HeaderTableCell>
                        <HeaderTableCell align="center" width="20%">Số lượng</HeaderTableCell>
                        <HeaderTableCell align="right" width="15%" sx={{ pr: 4 }}>Tổng</HeaderTableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {cart.items.map((item) => {
                        const isUpdating = updatingId === item.product._id;
                        return (
                          <TableRow key={item._id} hover>
                            {/* Product Info - Align Left */}
                            <StyledTableCell align="left" sx={{ pl: 4 }}>
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 72, height: 72,
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    border: '1px solid #f3f4f6',
                                    flexShrink: 0,
                                    bgcolor: 'white'
                                  }}
                                >
                                  <img
                                    src={getImageUrl(item.product?.images?.[0])}
                                    alt={item.product?.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                                  />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111827', lineHeight: 1.2 }}>
                                    {item.product?.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Mã: {item.product?._id?.slice(-6).toUpperCase()}
                                  </Typography>
                                  {/* Mobile Delete Button (Optional) */}
                                </Box>
                              </Box>
                            </StyledTableCell>

                            {/* Unit Price - Align Center */}
                            <StyledTableCell align="center">
                              <Typography variant="body2" fontWeight={600} color="text.secondary">
                                {Number(item.product?.price || 0).toLocaleString()}₫
                              </Typography>
                            </StyledTableCell>

                            {/* Quantity - Align Center */}
                            <StyledTableCell align="center">
                              <QuantityBox>
                                <QuantityBtn
                                  size="small"
                                  disabled={isUpdating || item.quantity <= 1}
                                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                >
                                  <Remove sx={{ fontSize: 16 }} />
                                </QuantityBtn>

                                <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {isUpdating ? <CircularProgress size={14} color="inherit" /> : item.quantity}
                                </Typography>

                                <QuantityBtn
                                  size="small"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                >
                                  <Add sx={{ fontSize: 16 }} />
                                </QuantityBtn>
                              </QuantityBox>
                            </StyledTableCell>

                            {/* Total & Delete - Align Right */}
                            <StyledTableCell align="right" sx={{ pr: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                <Typography variant="body1" fontWeight={700} sx={{ color: '#111827' }}>
                                  {Number((item.product?.price || 0) * item.quantity).toLocaleString()}₫
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveItem(item.product._id)}
                                  disabled={isUpdating}
                                  sx={{
                                    color: '#9ca3af',
                                    p: 0.5,
                                    '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' }
                                  }}
                                >
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </Box>
                            </StyledTableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CartPaper>

              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{ mt: 3, color: '#6b7280', fontWeight: 500, '&:hover': { color: '#111827', bgcolor: 'transparent' } }}
              >
                Tiếp tục mua sắm
              </Button>
            </Grid>

            {/* RIGHT COLUMN: Summary */}
            <Grid item xs={12} lg={4}>
              <SummaryCard elevation={0}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  Tóm tắt đơn hàng
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary" variant="body2">Tạm tính</Typography>
                  <Typography fontWeight={600}>{Number(cart.totalPrice).toLocaleString()}₫</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography color="text.secondary" variant="body2">Giảm giá</Typography>
                  <Typography fontWeight={600} color="success.main">-0₫</Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                  <Typography variant="body1" fontWeight={600}>Tổng cộng</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#2563eb' }}>
                      {Number(cart.totalPrice).toLocaleString()}₫
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Đã bao gồm VAT</Typography>
                  </Box>
                </Box>

                <CheckoutButton fullWidth onClick={handleCheckout}>
                  Tiến hành thanh toán
                </CheckoutButton>
              </SummaryCard>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            {/* Empty State UI */}
            <Typography variant="h4" fontWeight={600}>Giỏ hàng trống</Typography>
            <Button onClick={() => navigate('/')}>Quay lại</Button>
          </Box>
        )}
      </Container>
    </FontWrapper>
  );
};

export default Cart;