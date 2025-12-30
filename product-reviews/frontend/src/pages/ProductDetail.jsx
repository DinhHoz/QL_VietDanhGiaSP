import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Rating, Button, TextField,
  Box, Alert, Tabs, Tab, Grid, InputLabel, Select, MenuItem, FormControl,
  IconButton, Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Menu, Radio, RadioGroup, FormControlLabel, FormLabel,
  Tooltip, Divider
} from '@mui/material';

// Icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag'; // Icon báo cáo
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

// Utils & Context
import api, { getImageUrl } from '../utils/api';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useAddToCart } from '../utils/cartHelpers';
import './ProductDetail.css';

// SweetAlert2
import Swal from 'sweetalert2';

// Cấu hình Toast (Thông báo nhỏ góc màn hình)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const REPORT_OPTIONS = [
  { value: "not_related", label: "Nội dung không đúng thực tế / Không liên quan" },
  { value: "abusive", label: "Ngôn từ gây thù địch / Xúc phạm" },
  { value: "spam", label: "Spam / Quảng cáo rác" },
  { value: "sensitive_image", label: "Hình ảnh không phù hợp / Nhạy cảm" },
  { value: "other", label: "Lý do khác" }
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleAddToCartOrigin = useAddToCart(); // Hook gốc

  // Data State
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentReviewId, setCurrentReviewId] = useState(null);

  // Review Form State
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Report State
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReviewToReport, setSelectedReviewToReport] = useState(null);
  const [reportReason, setReportReason] = useState(REPORT_OPTIONS[0].value);

  // Reply State
  const [replyInputs, setReplyInputs] = useState({});
  const [replyLoading, setReplyLoading] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { comment: '', rating: 5 },
  });

  // --- API Calls ---

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`),
      ]);

      setProduct(pRes.data);
      setReviews(rRes.data.reviews || []);

      // Cập nhật meta rating client-side nếu cần thiết
      if (pRes.data && rRes.data.reviews.length > 0) {
        const avg = rRes.data.reviews.reduce((sum, rv) => sum + rv.rating, 0) / rRes.data.reviews.length;
        setProduct(prev => ({ ...prev, meta: { ...prev.meta, avgRating: avg, totalReviews: rRes.data.reviews.length } }));
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Không thể tải dữ liệu sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // --- Handlers: Cart & Quantity ---

  const handleAddToCartWrapper = async () => {
    try {
      await handleAddToCartOrigin(product._id, quantity);
      Toast.fire({
        icon: 'success',
        title: 'Đã thêm vào giỏ hàng!'
      });
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Thêm vào giỏ thất bại'
      });
    }
  };
  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(prev => Math.min(prev + 1, product.stock || 99));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  // --- Handlers: Review CRUD ---

  const onSubmitReview = async (data) => {
    try {
      const formData = new FormData();
      formData.append("comment", data.comment);
      formData.append("rating", data.rating);

      if (data.images && data.images.length > 0) {
        Array.from(data.images).forEach((img) => formData.append("images", img));
      }

      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Toast.fire({ icon: 'success', title: 'Cập nhật đánh giá thành công!' });
        setEditingReviewId(null);
      } else {
        formData.append("productId", id);
        await api.post("/reviews", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Toast.fire({ icon: 'success', title: 'Gửi đánh giá thành công!' });
      }

      reset({ comment: '', rating: 5 });
      setShowReviewForm(false);
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', err.response?.data?.error || 'Không thể gửi đánh giá.', 'error');
    }
  };

  const handleDeleteReview = (reviewId) => {
    handleMenuClose();
    Swal.fire({
      title: 'Bạn chắc chắn?',
      text: "Đánh giá này sẽ bị xóa vĩnh viễn!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/reviews/${reviewId}`);
          setReviews(prev => prev.filter(r => r._id !== reviewId));
          loadData();
          Swal.fire('Đã xóa!', 'Đánh giá đã được xóa.', 'success');
        } catch (err) {
          Swal.fire('Lỗi', 'Không thể xóa review.', 'error');
        }
      }
    });
  };

  const handleEditReview = (review) => {
    handleMenuClose();
    reset({ comment: review.comment, rating: review.rating });
    setEditingReviewId(review._id);
    setShowReviewForm(true);
  };

  // --- Handlers: Report Review ---

  const openReportDialog = (reviewId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedReviewToReport(reviewId);
    setReportReason(REPORT_OPTIONS[0].value);
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    try {
      // Giả lập API call report
      await api.post(`/reports/reviews/${selectedReviewToReport}/report`, {
        reason: reportReason
      });
      console.log("Reporting review:", selectedReviewToReport, "Reason:", reportReason);

      setReportDialogOpen(false);
      Toast.fire({
        icon: 'success',
        title: 'Đã gửi báo cáo. Cảm ơn phản hồi của bạn!'
      });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Lỗi khi gửi báo cáo.' });
    }
  };

  // --- Handlers: Reply ---

  const handleReplyChange = (reviewId, value) => {
    setReplyInputs(prev => ({ ...prev, [reviewId]: value }));
  };

  const submitReply = async (reviewId, parentReplyId = null, toUserId = null) => {
    const content = replyInputs[reviewId]?.trim();
    if (!content) return;
    try {
      setReplyLoading(true);
      await api.post(`/replies/review/${reviewId}`, { content, parentReplyId, toUserId });
      setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
      await loadData();
      Toast.fire({ icon: 'success', title: 'Đã trả lời!' });
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Lỗi gửi trả lời.' });
    } finally {
      setReplyLoading(false);
    }
  };

  const updateReply = async replyId => {
    if (!editingReplyContent.trim()) return;
    try {
      await api.put(`/replies/${replyId}`, { content: editingReplyContent });
      setEditingReplyId(null);
      setEditingReplyContent('');
      await loadData();
      Toast.fire({ icon: 'success', title: 'Đã cập nhật trả lời.' });
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Lỗi cập nhật.' });
    }
  };

  const deleteReply = async replyId => {
    Swal.fire({
      title: 'Xóa câu trả lời?',
      text: "Hành động này không thể hoàn tác.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/replies/${replyId}`);
          await loadData();
          Toast.fire({ icon: 'success', title: 'Đã xóa trả lời.' });
        } catch (err) {
          Toast.fire({ icon: 'error', title: 'Lỗi xóa trả lời.' });
        }
      }
    });
  };

  // --- Logic View ---

  const sortedReviews = useMemo(() => {
    let sorted = [...reviews];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted;
  }, [reviews, sortBy]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(rv => counts[rv.rating]++);
    return counts;
  }, [reviews]);

  const totalReviews = reviews.length;
  const avgRating = product?.meta?.avgRating || (totalReviews > 0 ? reviews.reduce((sum, rv) => sum + rv.rating, 0) / totalReviews : 0);
  const displayReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 5);

  const getRatingLabel = (rating) => {
    const labels = { 5: 'Tuyệt vời', 4: 'Tốt', 3: 'Trung bình', 2: 'Kém', 1: 'Rất kém' };
    return labels[rating] || '';
  };

  const handleMenuClick = (reviewId, event) => {
    setCurrentReviewId(reviewId);
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentReviewId(null);
  };

  // Component Loading/Error
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Typography>Đang tải dữ liệu...</Typography></Box>;
  if (!product) return <Alert severity="warning">Sản phẩm không tồn tại.</Alert>;

  const currentReview = reviews.find(r => r._id === currentReviewId);

  return (
    <Container maxWidth="lg" className="product-detail-container" sx={{ py: 4 }}>
      {/* --- Product Info Section --- */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={5} sx={{ display: "flex", justifyContent: "center", alignItems: "start" }}>
          <Box
            component="img"
            src={product.images?.[0] ? `http://localhost:4000${product.images[0]}` : "https://via.placeholder.com/400"}
            alt={product.name}
            sx={{ width: '100%', borderRadius: 2, boxShadow: 3, objectFit: 'cover', maxHeight: '500px' }}
          />
        </Grid>

        <Grid item xs={12} md={7}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>{product.name}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating value={avgRating} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">({totalReviews} đánh giá)</Typography>
            <Chip label={product.category || 'N/A'} size="small" color="primary" variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 3 }}>
            <Typography variant="h3" color="error.main" fontWeight="bold">
              {Number(product.price).toLocaleString('vi-VN')}₫
            </Typography>
            {product.oldPrice && (
              <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through', mb: 0.5 }}>
                {Number(product.oldPrice).toLocaleString('vi-VN')}₫
              </Typography>
            )}
          </Box>

          <Typography variant="body1" paragraph color="text.secondary">
            {product.shortDescription || 'Sản phẩm chất lượng cao, chính hãng.'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography fontWeight="medium">Số lượng:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
              <IconButton onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}>
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ px: 2, fontWeight: 'bold' }}>{quantity}</Typography>
              <IconButton onClick={() => handleQuantityChange('increase')} disabled={quantity >= (product.stock || 99)}>
                <AddIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {product.stock !== undefined ? `${product.stock} sản phẩm có sẵn` : ''}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCartWrapper}
              sx={{ flexGrow: 1, py: 1.5, fontSize: '1.1rem' }}
            >
              Thêm vào giỏ hàng
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* --- Tabs Section --- */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Mô tả chi tiết" />
          <Tab label={`Đánh giá (${totalReviews})`} />
        </Tabs>

        {/* Tab Description */}
        {tabValue === 0 && (
          <Card elevation={0} sx={{ bgcolor: '#f9f9f9' }}>
            <CardContent>
              <Typography sx={{ whiteSpace: 'pre-line' }}>
                {product.description || 'Mô tả đang cập nhật...'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Tab Reviews */}
        {tabValue === 1 && (
          <Box>
            {/* Reviews Header / Summary */}
            <Grid container spacing={3} sx={{ mb: 4, alignItems: 'center' }}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center', borderRight: { md: '1px solid #eee' } }}>
                <Typography variant="h2" fontWeight="bold" color="primary">{avgRating.toFixed(1)}</Typography>
                <Rating value={avgRating} readOnly precision={0.5} size="large" />
                <Typography color="text.secondary">{totalReviews} nhận xét</Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ minWidth: 80, display: 'flex' }}>
                      {[...Array(star)].map((_, index) => (
                        <StarIcon key={index} sx={{ fontSize: 12, color: '#faaf00' }} />
                      ))}
                    </Typography>
                  </Box>
                ))}
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" onClick={() => user ? setShowReviewForm(true) : navigate('/login')}>
                  Viết đánh giá
                </Button>
                <FormControl size="small">
                  <InputLabel>Sắp xếp</InputLabel>
                  <Select value={sortBy} label="Sắp xếp" onChange={(e) => setSortBy(e.target.value)}>
                    <MenuItem value="newest">Mới nhất</MenuItem>
                    <MenuItem value="oldest">Cũ nhất</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Reviews List */}
            {displayReviews.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>Chưa có đánh giá nào.</Typography>
            ) : (
              displayReviews.map((rv) => (
                <Card key={rv._id} sx={{ mb: 2, borderRadius: 2 }} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{rv.userName?.charAt(0)}</Avatar>
                        <Box>
                          <Typography fontWeight="bold">{rv.userName}</Typography>
                          <Rating value={rv.rating} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary" display="block">
                            {new Date(rv.createdAt).toLocaleString('vi-VN')} | {getRatingLabel(rv.rating)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        {/* Nút Report cho User khác */}
                        {user && user._id !== rv.userId && (
                          <Tooltip title="Báo cáo bài viết này">
                            <IconButton color="default" size="small" onClick={() => openReportDialog(rv._id)}>
                              <FlagIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Menu Hành động (Sửa/Xóa) cho chủ sở hữu hoặc Admin */}
                        {(user && (user._id === rv.userId || user.role === "admin")) && (
                          <IconButton size="small" onClick={(e) => handleMenuClick(rv._id, e)}>
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Typography sx={{ mt: 2, mb: 1 }}>{rv.comment}</Typography>

                    {rv.images?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <img src={getImageUrl(rv.images[0])} alt="Review" style={{ maxWidth: 100, borderRadius: 8 }} />
                      </Box>
                    )}

                    {/* --- Replies Section --- */}
                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mt: 2 }}>
                      {/* Admin Replies */}
                      {rv.adminReplies?.map(reply => (
                        <Box key={reply._id} sx={{ mb: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
                          <Typography variant="subtitle2" color="primary"> Quản trị viên</Typography>
                          <Typography variant="body2">{reply.content}</Typography>
                        </Box>
                      ))}

                      {/* User Replies */}
                      {rv.userReplies?.map(reply => (
                        <Box key={reply._id} sx={{ mb: 1, pl: 1, borderLeft: '2px solid #ddd' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {reply.authorId?.name || 'Người dùng'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Box>

                          {/* Edit Mode for Reply */}
                          {editingReplyId === reply._id ? (
                            <Box sx={{ mt: 1 }}>
                              <TextField
                                size="small" fullWidth
                                value={editingReplyContent}
                                onChange={e => setEditingReplyContent(e.target.value)}
                              />
                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" onClick={() => updateReply(reply._id)}>Lưu</Button>
                                <Button size="small" onClick={() => setEditingReplyId(null)}>Hủy</Button>
                              </Box>
                            </Box>
                          ) : (
                            <>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {reply.toUserId && <span style={{ color: '#888' }}>@{reply.toUserId?.name} </span>}
                                {reply.content}
                              </Typography>

                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                {user && (
                                  <Typography
                                    variant="caption"
                                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                                    onClick={() => handleReplyChange(rv._id, `@${reply.authorId?.name} `)}
                                  >
                                    Trả lời
                                  </Typography>
                                )}
                                {(user && (reply.authorId?._id === user._id || user.role === 'admin')) && (
                                  <>
                                    <Typography variant="caption" sx={{ cursor: 'pointer' }} onClick={() => { setEditingReplyId(reply._id); setEditingReplyContent(reply.content); }}>Sửa</Typography>
                                    <Typography variant="caption" sx={{ cursor: 'pointer', color: 'error.main' }} onClick={() => deleteReply(reply._id)}>Xóa</Typography>
                                  </>
                                )}
                              </Box>
                            </>
                          )}
                        </Box>
                      ))}

                      {/* Input Reply */}
                      {user && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Viết câu trả lời..."
                            value={replyInputs[rv._id] || ''}
                            onChange={e => handleReplyChange(rv._id, e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') submitReply(rv._id); }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            disabled={replyLoading}
                            onClick={() => submitReply(rv._id)}
                          >
                            Gửi
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}

            {/* View All Button */}
            {totalReviews > 5 && (
              <Box textAlign="center" mt={2}>
                <Button onClick={() => setShowAllReviews(!showAllReviews)}>
                  {showAllReviews ? 'Thu gọn' : `Xem tất cả ${totalReviews} đánh giá`}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* --- Dialogs & Menus --- */}

      {/* 1. Review Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {currentReview && user._id === currentReview.userId && (
          <MenuItem onClick={() => handleEditReview(currentReview)}>Chỉnh sửa</MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteReview(currentReview?._id)} sx={{ color: 'error.main' }}>Xóa bài viết</MenuItem>
      </Menu>

      {/* 2. Create/Edit Review Dialog */}
      <Dialog open={showReviewForm} onClose={() => setShowReviewForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingReviewId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá mới'}</DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit(onSubmitReview)}>
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography component="legend">Mức độ hài lòng</Typography>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Rating {...field} size="large" onChange={(e, v) => field.onChange(v)} />
                )}
              />
            </Box>
            <TextField
              {...register("comment", { required: true })}
              label="Nhận xét của bạn"
              multiline rows={4} fullWidth margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <input type="file" {...register("images")} accept="image/*" />
            </Box>
            <DialogActions sx={{ px: 0, mt: 2 }}>
              <Button onClick={() => setShowReviewForm(false)} color="inherit">Hủy</Button>
              <Button onClick={() => setShowReviewForm(false)} type="submit" variant="contained">Gửi đánh giá</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Report Review Dialog (Tính năng mới) */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportProblemIcon color="warning" /> Báo cáo đánh giá
        </DialogTitle>
        {/* Phần Dialog trong JSX */}
        <DialogContent dividers>
          <FormControl component="fieldset">
            <FormLabel component="legend">Vui lòng chọn lý do:</FormLabel>
            <RadioGroup
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              {/* --- SỬA ĐOẠN NÀY --- */}
              {REPORT_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)} color="inherit">Hủy bỏ</Button>
          <Button onClick={handleSubmitReport} variant="contained" color="error">Gửi báo cáo</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default ProductDetail;