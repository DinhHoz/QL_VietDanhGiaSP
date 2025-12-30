import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    try {
      setServerError('');

      // Gọi hàm login trong AuthContext
      await login(data.email, data.password);

      // Sau khi login → chuyển sang Home
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);

      // Lấy error từ backend
      const message =
        error?.response?.data?.msg ||
        "Đăng nhập thất bại. Kiểm tra lại email hoặc mật khẩu.";

      setServerError(message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Đăng nhập
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("email", { required: "Email bắt buộc" })}
          fullWidth
          label="Email"
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          {...register("password", { required: "Password bắt buộc" })}
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        {serverError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {serverError}
          </Alert>
        )}

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
          Đăng nhập
        </Button>
      </form>
    </Container>
  );
};

export default Login;
