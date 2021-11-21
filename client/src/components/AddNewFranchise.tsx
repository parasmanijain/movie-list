import React from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { Box, Button, FormControl, TextField } from '@mui/material';
import { ADD_NEW_FRANCHISE_URL } from '../helper/config';
import { franchiseValidationSchema as validationSchema } from '../helper/validationScehmas';

export const AddNewFranchise = () => {
  const formik = useFormik({
    initialValues: {
      name: ''
    },
    validationSchema,
    onSubmit: () => {
      axios.post(`${ADD_NEW_FRANCHISE_URL}`, {
        name: formik.values.name,
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
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Franchise"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>

      </Box>
    </form>
  );
};
