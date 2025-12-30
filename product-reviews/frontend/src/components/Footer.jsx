import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Instagram, Twitter, GitHub, Email, LocationOn, Phone } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Sử dụng lại Style Logo giống Header để đồng bộ thương hiệu
const FooterLogo = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 800,
  background: 'linear-gradient(45deg, #2563eb 30%, #ec4899 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
  marginBottom: '10px'
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: '#4b5563', // Text-gray-600
  textDecoration: 'none',
  fontSize: '0.9rem',
  marginBottom: '8px',
  display: 'block',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#2563eb', // Blue-600
    textDecoration: 'none',
    transform: 'translateX(5px)' // Hiệu ứng dịch chuyển nhẹ
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: '#6b7280',
  border: '1px solid #e5e7eb',
  marginRight: '8px',
  transition: 'all 0.3s',
  '&:hover': {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb',
    transform: 'translateY(-3px)'
  }
}));

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#ffffff', // Nền trắng
        borderTop: '1px solid #f3f4f6', // Viền trên nhẹ
        color: '#1f2937',
        pt: 8,
        pb: 4,
        mt: 'auto', // Đẩy footer xuống đáy nếu nội dung ngắn
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>

          {/* Cột 1: Thông tin thương hiệu */}
          <Grid item xs={12} md={4}>
            <FooterLogo variant="h5">
              PhoneZone
            </FooterLogo>
            <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.8, maxWidth: '300px' }}>
              
            </Typography>

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#4b5563' }}>
              <LocationOn fontSize="small" sx={{ color: '#2563eb' }} />
              <Typography variant="body2">Ho Chi Minh City, Vietnam</Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#4b5563' }}>
              <Phone fontSize="small" sx={{ color: '#2563eb' }} />
              <Typography variant="body2">+84 90 123 4567</Typography>
            </Box>
          </Grid>

          {/* Cột 2: Liên kết nhanh */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, color: '#111827' }}>
              Khám phá
            </Typography>
            <FooterLink href="/">Trang chủ</FooterLink>
            <FooterLink href="/products">Sản phẩm</FooterLink>
            <FooterLink href="/categories">Danh mục</FooterLink>
            <FooterLink href="/top-rated">Bảng xếp hạng</FooterLink>
          </Grid>

          {/* Cột 3: Tài khoản & Hỗ trợ */}
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, color: '#111827' }}>
              Hỗ trợ
            </Typography>
            <FooterLink href="/login">Đăng nhập</FooterLink>
            <FooterLink href="/register">Đăng ký thành viên</FooterLink>
            <FooterLink href="/policy">Chính sách bảo mật</FooterLink>
            <FooterLink href="/terms">Điều khoản sử dụng</FooterLink>
          </Grid>

          {/* Cột 4: Mạng xã hội */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, color: '#111827' }}>
              Kết nối với chúng tôi
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              Theo dõi để nhận các ưu đãi và thông tin mới nhất.
            </Typography>
            <Box>
              <SocialButton aria-label="facebook"><Facebook /></SocialButton>
              <SocialButton aria-label="instagram"><Instagram /></SocialButton>
              <SocialButton aria-label="twitter"><Twitter /></SocialButton>
              <SocialButton aria-label="github"><GitHub /></SocialButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#f3f4f6' }} />

        {/* Copyright */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            © {new Date().getFullYear()} ReviewHub. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="hover" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>Privacy</Link>
            <Link href="#" underline="hover" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>Terms</Link>
            <Link href="#" underline="hover" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>Sitemap</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;