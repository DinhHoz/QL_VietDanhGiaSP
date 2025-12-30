import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const bannerImages = [
    {
      id: 1,
      image: '/src/img/690x300_MacBookProM5_opensale.jpg',
      alt: 'Banner 1'
    },
    {
      id: 2,
      image: '/src/img/home-Huawei-pad-1125.jpg',
      alt: 'Banner 2'
    },
    {
      id: 3,
      image: '/src/img/home_Nubia_Neo-3-Series-1125.jpg',
      alt: 'Banner 3'
    }
  ];

  const promoBanners = [
    {
      id: 1,
      title: 'Ưu Đãi Sinh Viên',
      image: '/src/img/aicopisd.jpg',
      link: '/promo/student-teacher'
    },
    {
      id: 2,
      title: 'Ưu Đãi Thanh Toán',
      image: '/src/img/sdfsdf.jpg',
      link: '/promo/installment'
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get('/products');

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
          ? res.data.products
          : [];

        setProducts(data);
      } catch (err) {
        console.error('Lỗi fetch products:', err);
        setError(err.response?.data?.msg || 'Không thể tải sản phẩm.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="alert alert-info">Đang tải sản phẩm...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="home-container">
      {/* Banner Slider */}
      {bannerImages.length > 0 && <BannerSlider banners={bannerImages} />}

      {/* Products Section */}
      <div className="products-section">
        {products.length === 0 ? (
          <div className="alert alert-warning">
            Chưa có sản phẩm nào. Admin hãy tạo sản phẩm!
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-container">
                  <img
                    className="product-image"
                    src={
                      product.images?.[0]
                        ? `http://localhost:4000${product.images[0]}`
                        : 'https://via.placeholder.com/300'
                    }
                    alt={product.name}
                  />
                </div>

                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  
                  <div className="product-price">
                    {Number(product.price).toLocaleString()}₫
                  </div>

                  <button
                    className="product-btn"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promo Banners Section */}
      {promoBanners.length > 0 && (
        <div className="promo-section">
          <div className="promo-grid">
            {promoBanners.map((promo) => (
              <div key={promo.id} className="promo-card">
                <div className="promo-content">
                  <h3 className="promo-title">{promo.title}</h3>
                  <div className="promo-image-container">
                    <img
                      className="promo-image"
                      src={promo.image}
                      alt={promo.title}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Banner Slider Component
const BannerSlider = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="banner-slider">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
        >
          <img src={banner.image} alt={banner.alt} />
        </div>
      ))}

      {/* Indicators */}
      <div className="slider-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="slider-btn prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        className="slider-btn next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        ›
      </button>
    </div>
  );
};

export default Home;