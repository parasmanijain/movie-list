import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import { makeStyles } from '@mui/styles';
import { Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Pagination, Button, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GET_MOVIES_URL, GET_TOP_DIRECTOR_URL, GET_TOP_LANGUAGE_URL, GET_TOP_YEAR_URL } from '../helper/config';

// const useStyles = makeStyles({
//   root: {
//     width: '100%',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     height: '100%'
//   },
//   title: {
//     fontSize: 14
//   },
//   pos: {
//     marginBottom: 12
//   }
// });

const summaryStyles = makeStyles({
  root: {
    minHeight: 60,
    padding: '5px'
  },
  content: {
    margin: 0
  }
});

interface HomeProps {
  handleMovieUpdateSelection:any;
}

export const Home = (props:HomeProps) => {
  const { handleMovieUpdateSelection } = props;
  const summaryClass = summaryStyles();
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 40;
  const history = useHistory();

  const fetchData = () => {
    const moviesUrl = axios.get(`${GET_MOVIES_URL}`, { params: { page, limit } });
    axios.all([moviesUrl]).then(axios.spread((...responses) => {
      const { total, page, movies } = responses[0].data;
      setMovieData(movies);
      setTotal(total);
      setPage(page);
      setCount(Math.ceil(total / limit));
    })).catch((errors) => {
      // react on errors.
    });
  };

  const fetchTopFilters = () => {
    const topDirectors = axios.get(`${GET_TOP_DIRECTOR_URL}`);
    const topLanguages = axios.get(`${GET_TOP_LANGUAGE_URL}`);
    const topYear = axios.get(`${GET_TOP_YEAR_URL}`);
    axios.all([topDirectors, topLanguages, topYear]).then(axios.spread((...responses) => {
      setTopDirectorData(responses[0].data.slice(0, 1));
      setTopLanguageData(responses[1].data.slice(0, 1));
      setTopYearData(responses[2].data.slice(0, 1));
    })).catch((errors) => {
      // react on errors.
    });
  };
  useEffect(() => {
    fetchData();
    return () => {
    };
  }, [page]);

  useEffect(() => {
    fetchTopFilters();
    return () => {
    };
  }, []);
  const [movieData, setMovieData] = useState([]);
  const [topDirectorData, setTopDirectorData] = useState([]);
  const [topLanguageData, setTopLanguageData] = useState([]);
  const [topYearData, setTopYearData] = useState([]);

  const otherMovies = (movie, movies, id, name, index, arr) => {
    return arr.length > 1 ? <React.Fragment><Typography variant="button" display="block">{name}</Typography>
      {
        displayOtherMovies(movies)
      }</React.Fragment> : displayOtherMovies(movies);
  };

  const displayOtherMovies = (movies) => movies.map((otherMovie) => {
    return otherMovieLinks(otherMovie);
  });

  const otherMovieLinks = (otherMovie) => {
    return (
      <Typography component="div" key={otherMovie._id} >
        <Button href={otherMovie.url} target="_blank" rel="noreferrer" sx={{ padding: '4px 0px' }}>
          {otherMovie.name} ({otherMovie.year})
        </Button>
      </Typography>
    );
  };

  const directorURL = (url, name, id, index, length) => (
    <React.Fragment key={id}>
      <Button href={url} target="_blank" rel="noreferrer" variant="text" sx={{ padding: '4px 0px' }}>
        {name}
      </Button>
      {index !== length-1 ? ' , ' : null}
    </React.Fragment>
  );


  const directorName = (director, index, length) => directorURL(director.url, director.name, director._id, index, length);

  const movieList = movieData?.map((movie) => (
    <Grid item xs = {3} key={movie._id}>
      <Accordion sx = {{ padding: '0px' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />
          }
          classes={summaryClass}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="button" display="block">
            {movie.name} ({movie.year})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div" sx={{ padding: '0px' }}>
            {
              movie.language.map(
                  (element, index, arr)=><Typography key={element._id} variant="button" display="span" sx={{ padding: '4px 0px' }}>
                    {element.name} {index !== arr.length-1 ? ', ' : null}</Typography>)
            }

            <Typography component="div">
              {
                movie.director.map((element, index, arr) => directorName(element, index, arr.length))
              }
            </Typography>
            <Typography component="h6" sx={{ padding: '4px 0px' }}>
                IMDB:
              {movie.imdb + '/10'}
            </Typography>
            <Typography component="h6" sx={{ padding: '4px 0px' }}>
                Rotten Tomatoes:
              {movie.rottenTomatoes ? movie.rottenTomatoes + '%' : 'Not Rated'}
            </Typography>
            <Typography component="div">
              <Button
                variant="text"
                sx={{ padding: '4px 0px' }}
                onClick={() => {
                  handleMovieUpdateSelection(movie._id);
                  history.push('/add-new-movie');
                }}
              >
                Edit Movie Details
              </Button>
            </Typography>
            <Typography component="div">
              <Button href={movie.url} target="_blank" rel="noreferrer" sx={{ padding: '4px 0px' }}>
              More Details
              </Button>
            </Typography>
            <Typography component="h6" sx={{ padding: '4px 0px' }}>
                Other Movies from Same Director:
            </Typography>
            {
              movie.director.map((element, index, arr) => {
                const { _id, movies, name } = element;
                const otherMovieList = movies.filter((otherMovie)=> otherMovie._id !== movie._id);
                return otherMovies(movie, otherMovieList, _id, name, index, arr);
              })
            }
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Grid>
  ));

  const topDirectorsList = topDirectorData.map((director) => (
    <Typography variant="button" display="span" key={director._id}>{director.name} ({director.length}) </Typography>
  ));
  const topYearsList = topYearData.map((year) => (
    <Typography variant="button" display="span" key={year._id}>{year._id} ({year.count}) </Typography>
  ));

  const topLanguagesList = topLanguageData.map((language) => (
    <Typography variant="button" display="span"key={language._id}>{language.name} ({language.length}) </Typography>
  ));

  const handleChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', margin: '16px 0px', justifyContent: 'space-evenly', alignItems: 'center' }}>
        <Typography component="h6">Total Movies watched so far: {total}</Typography>
        <Typography component="h6">Most watched Director: {topDirectorsList}</Typography>
        <Typography component="h6">Most watched Language: {topLanguagesList}</Typography>
        <Typography component="h6">Most watched Year: {topYearsList}</Typography>
      </Box>
      <Grid container spacing ={2} sx={{ margin: '16px 0px', padding: '0px' }}>
        {movieList}
      </Grid>
      <Box sx={{ margin: '16px 0px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Pagination count={count} color="primary" onChange={handleChange} page={page} showFirstButton showLastButton />
      </Box>
    </Box>
  );
};
