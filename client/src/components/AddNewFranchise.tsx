import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import axiosConfig from '../helper/axiosConfig';
import { ADD_NEW_FRANCHISE_URL, GET_UNIVERSES_URL, MenuProps } from '../helper/config';
import { franchiseValidationSchema as validationSchema } from '../helper/validationScehmas';
import { Box, Button, TextField, Select, InputLabel, ListItemText, FormControl, MenuItem,
  OutlinedInput, FormHelperText } from '../lib';

export const AddNewFranchise = () => {
  const [universeData, setUniverseData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      universe: ''
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig.post(`${ADD_NEW_FRANCHISE_URL}`, {
        name: formik.values.name,
        universe: formik.values.universe ? formik.values.universe : null,
        movies: []
      })
          .then(function(response) {
            resetForm();
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });
  useEffect(() => {
    axiosConfig.get(`${GET_UNIVERSES_URL}`, {
    })
        .then(function(response) {
          setUniverseData(response.data);
        })
        .catch(function(response) {
          console.log(response);
        });
    return () => {
      setUniverseData([]);
    };
  }, []);
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
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="universe-label">Universe</InputLabel>
          <Select
            labelId="universe-label"
            id="universe"
            name="universe"
            value={formik.values.universe}
            onChange={formik.handleChange}
            error={formik.touched.universe && Boolean(formik.errors.universe)}
            input={<OutlinedInput label="Universe" />}
            MenuProps={MenuProps}
          >
            {[...universeData].map((universe) => (
              <MenuItem key={universe._id} value={universe._id}>
                <ListItemText primary={universe.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.universe && formik.errors.universe}</FormHelperText>
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>

      </Box>
    </form>
  );
};
