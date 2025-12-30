import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register: authRegister } = useAuth();  // hàm đăng ký từ Context
  const navigate = useNavigate();
  const { 
    register: registerForm,      // ⭐ đổi tên để không trùng
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    try {
      setServerError('');

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        isAdmin: data.isAdmin ? true : false,
      };

      await authRegister(payload);
      navigate('/login');
      
    } catch (error) {
      const message = error.response?.data?.msg || 'Lỗi đăng ký';
      setServerError(message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Đăng ký</Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...registerForm('name', { required: 'Tên bắt buộc' })}
          fullWidth
          label="Tên"
          margin="normal"
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          {...registerForm('email', { required: 'Email bắt buộc' })}
          fullWidth
          label="Email"
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          {...registerForm('password', { 
            required: 'Password bắt buộc',
            minLength: { value: 6, message: 'Ít nhất 6 ký tự' }
          })}
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        {/* <FormControlLabel
          control={<Checkbox {...registerForm('isAdmin')} />}
          label="Là Admin (test)"
        /> */}

        {serverError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {serverError}
          </Alert>
        )}

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
          Đăng ký
        </Button>
      </form>
    </Container>
  );
};

export default Register;
