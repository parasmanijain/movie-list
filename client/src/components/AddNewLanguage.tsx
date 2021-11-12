import React from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { API_URL } from '../helper/config';
import { Box, Button, FormControl, TextField } from '@mui/material';

const validationSchema = yup.object({
  name: yup
      .string()
      .required('Name is required'),
  code: yup
      .string()
      .required('Code is required').min(2)
});


export const AddNewLanguage = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      code: ''
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      console.log(formik.values);
      axios.post(`${API_URL}/language`, {
        name: formik.values.name,
        code: formik.values.code,
        movies: []
      })
          .then(function(response) {
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });
  return (
    <form id="form" onSubmit={formik.handleSubmit} autoComplete="off">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="code"
            name="code"
            label="Code"
            value={formik.values.code}
            onChange={formik.handleChange}
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code}
          />
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </form>
  );
};
