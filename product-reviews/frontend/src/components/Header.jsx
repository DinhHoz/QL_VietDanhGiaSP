// Header.jsx — Clean White UI + Better UX
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  InputBase,
  Select,
  FormControl,
  MenuItem as MuiMenuItem,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';

import {
  ShoppingCartOutlined,
  Search,
  Clear,
  PersonOutline,
  DashboardOutlined,
  Logout,
  Login,
  AppRegistration,
  KeyboardArrowDown
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { getCart } from '../utils/cart';
import { getCategories } from '../utils/categories';

/* ====================== STYLED COMPONENTS ===================== */

// Logo Gradient Text
const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif", // Nếu chưa có font này thì dùng sans-serif mặc định
  fontWeight: 800,
  background: 'linear-gradient(45deg, #2563eb 30%, #ec4899 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  cursor: 'pointer',
  letterSpacing: '-0.5px',
  display: 'flex',
  alignItems: 'center',
}));

// Thanh tìm kiếm hiện đại
const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 50, // Bo tròn kiểu viên thuốc (Pill shape)
  backgroundColor: '#f3f4f6', // Màu xám nhạt trên nền trắng
  transition: 'all 0.3s ease',
  width: '100%',
  maxWidth: 500, // Giới hạn chiều rộng tối đa
  display: 'flex',
  alignItems: 'center',
  padding: '4px 6px 4px 20px',
  border: '2px solid transparent',

  '&:hover': {
    backgroundColor: '#fff',
    border: '2px solid #e5e7eb',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  '&:focus-within': {
    backgroundColor: '#fff',
    border: '2px solid #2563eb', // Border xanh khi focus
    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
  }
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  color: '#1f2937',
  width: '100%',
  fontSize: '0.95rem',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
  },
}));

const SearchButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#2563eb',
  color: '#fff',
  padding: 8,
  borderRadius: '50%',
  transition: '0.2s',
  '&:hover': {
    backgroundColor: '#1d4ed8',
    transform: 'scale(1.05)'
  }
}));

// Dropdown danh mục tối giản
const CategorySelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '8px 32px 8px 12px',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  '& fieldset': { border: 'none' }, // Bỏ viền mặc định
  '&:hover': { backgroundColor: '#f9fafb', borderRadius: 8 },
  '& .MuiSvgIcon-root': { color: '#6b7280' }
}));

/* ======================================================= */

const Header = ({ wishlistCount = 0 }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [scrolled, setScrolled] = useState(false);

  /* ====================== SCROLL EFFECT ====================== */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ====================== LOAD DATA ====================== */
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories();
      if (result.success) setCategories(result.data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) return setCartCount(0);
      const result = await getCart();
      if (result.success) setCartCount(result.data.cart.totalItems || 0);
    };
    loadCart();
  }, [user]);

  /* ====================== HANDLERS ====================== */
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = searchValue.trim();
      const params = new URLSearchParams();
      if (trimmed) params.append('search', trimmed);
      if (selectedCategory) params.append('category', selectedCategory);
      navigate(`/products?${params.toString()}`);
    }
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff', // Nền trắng sạch
          borderBottom: scrolled ? 'none' : '1px solid #f3f4f6',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: scrolled ? 70 : 80,
          justifyContent: 'center',
          boxShadow: scrolled
            ? '0 4px 20px rgba(0,0,0,0.08)'
            : 'none',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, maxWidth: '1440px', width: '100%', margin: '0 auto' }}>

          {/* 1. LOGO AREA */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LogoText variant="h5" onClick={() => navigate('/')}>
              PhoneZone
            </LogoText>
          </Box>

          {/* 2. CENTER: SEARCH & CATEGORY */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            flexGrow: 1,
            justifyContent: 'center',
            maxWidth: 700
          }}>
            {/* Category Dropdown (Đặt cạnh Search) */}
            <FormControl variant="standard" sx={{ display: { xs: 'none', lg: 'block' } }}>
              <CategorySelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDown}
                MenuProps={{
                  PaperProps: { sx: { borderRadius: 3, marginTop: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }
                }}
              >
                <MuiMenuItem value="">
                  <span style={{ fontWeight: 600 }}>Tất cả danh mục</span>
                </MuiMenuItem>
                {categories.map((cat) => (
                  <MuiMenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MuiMenuItem>
                ))}
              </CategorySelect>
            </FormControl>

            {/* Search Bar */}
            <SearchBar>
              <SearchInput
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
              />
              {searchValue && (
                <IconButton size="small" onClick={() => setSearchValue('')} sx={{ color: '#9ca3af', mr: 1 }}>
                  <Clear fontSize="small" />
                </IconButton>
              )}
              <SearchButton onClick={handleSearch}>
                <Search fontSize="small" />
              </SearchButton>
            </SearchBar>
          </Box>

          {/* 3. RIGHT: ACTIONS */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

            {/* Cart Icon */}
            {!isAdmin && (
              <Tooltip title="Giỏ hàng">
                <IconButton
                  onClick={() => navigate('/cart')}
                  sx={{
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '8px',
                    '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }
                  }}
                >
                  <Badge badgeContent={cartCount} color="error" max={99}>
                    <ShoppingCartOutlined />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 1 }} />

            {/* User Section */}
            {user ? (
              <>
                <Button
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  startIcon={
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontSize: 14 }}
                      src={user.avatar} // Nếu user có avatar
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  endIcon={<KeyboardArrowDown sx={{ color: '#6b7280' }} />}
                  sx={{
                    textTransform: 'none',
                    color: '#1f2937',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '30px',
                    '&:hover': { backgroundColor: '#f3f4f6' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ lineHeight: 1 }}>Xin chào,</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.name}</Typography>
                  </Box>
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                      mt: 1.5,
                      borderRadius: 3,
                      minWidth: 180,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {isAdmin && (
                    <MenuItem onClick={() => navigate('/admin')}>
                      <DashboardOutlined fontSize="small" sx={{ mr: 1.5, color: '#6b7280' }} />
                      Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => navigate('/profile')}>
                    <PersonOutline fontSize="small" sx={{ mr: 1.5, color: '#6b7280' }} />
                    Hồ sơ cá nhân
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                    <Logout fontSize="small" sx={{ mr: 1.5 }} />
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Login />}
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': { borderColor: '#374151', backgroundColor: 'transparent' }
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  startIcon={<AppRegistration />}
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: '#111827', // Màu đen hiện đại
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: '#374151', boxShadow: 'none' }
                  }}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer */}
      <Box sx={{ height: scrolled ? 70 : 80 }} />
    </>
  );
};

export default Header;