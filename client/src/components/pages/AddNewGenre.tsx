import { useFormik } from 'formik';
import axiosConfig from '../../helper/axiosConfig';
import { ADD_NEW_GENRE_URL } from '../../helper/config';
import { genreValidationSchema as validationSchema } from '../../helper/validationScehmas';
import type { JSX } from 'react';
import { Box, Button, FormControl, TextField } from '@mui/material';

export const AddNewGenre = (): JSX.Element => {
  const formik = useFormik({
    initialValues: {
      name: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig
        .post(`${ADD_NEW_GENRE_URL}`, {
          name: formik.values.name,
          movies: []
        })
        .then(() => {
          resetForm();
        })
        .catch((errors) => {
          console.log(errors);
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
            label="Genre"
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
