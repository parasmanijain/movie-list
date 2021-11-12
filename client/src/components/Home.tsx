import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';

import { makeStyles } from '@mui/styles';
import { Grid, Typography, Link as MaterialLink, Accordion, AccordionSummary, AccordionDetails, Pagination } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { API_URL } from '../config';


const useStyles = makeStyles({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
});

const summaryStyles = makeStyles({
  root: {
    minHeight: 60,
    padding: '0 5px'
  },
  content: {
    margin: 0
  }
});
export const Home = () => {
  const classes = useStyles();
  const summaryClass = summaryStyles();
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 60;

  const fetchData = () => {
    const moviesUrl = axios.get(`${API_URL}/movies`, { params: { page, limit } });
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
    const topDirectors = axios.get(`${API_URL}/topDirector`);
    const topLanguages = axios.get(`${API_URL}/topLanguage`);
    const topYear = axios.get(`${API_URL}/topYear`);
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

  const directorURL = (url, name, index) => {
    return <MaterialLink key={index} href={url} target="_blank" rel="noreferrer">
      {name}
    </MaterialLink>;
  };

  const directorName = (director, index) => {
    return directorURL(director.url, director.name, index);
  };
  const movieList = movieData?.map((movie) => {
    return (
      <Grid item xs={6} lg={3} xl={2} key={movie._id}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />
            }
            classes={summaryClass}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography component="div">
              {movie.name} ({movie.year})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography component="div">
              {movie.language.name}
              <Typography component="div">
                {
                  movie.director.map((element, index) => directorName(element, index))
                }
              </Typography>
              <Typography component="div">
                IMDB:
                {movie.imdb + '/10'}
              </Typography>
              <Typography component="div">
                Rotten Tomatoes:
                {movie.rottenTomatoes ? movie.rottenTomatoes + '%' : 'Not Rated'}
              </Typography>
              <Typography component="div">
                <Link to={`/edit-movie-details/${movie._id}`}>Edit Movie Details</Link>
              </Typography>
              <MaterialLink href={movie.url} target="_blank" rel="noreferrer">
                More Details
              </MaterialLink>
              <Typography component="div">
                Other Movies from Same Director:
              </Typography>
              {
                movie.director.map((element, index) => {
                  return element.movies.map((otherMovie) => {
                    if (otherMovie._id !== movie._id) {
                      return (
                        <Typography key={otherMovie._id} component="div">
                          <MaterialLink href={otherMovie.url} target="_blank" rel="noreferrer">
                            {otherMovie.name} ({otherMovie.year})
                          </MaterialLink>
                        </Typography>
                      );
                    }
                  });
                })
              }
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Grid>
    );
  });

  const topDirectorsList = topDirectorData.map((director) => {
    return (
      <span key={director._id}>{director.name} ({director.length}) </span>
    );
  });
  const topYearsList = topYearData.map((year) => {
    return (
      <span key={year._id}>{year._id} ({year.count}) </span>
    );
  });
  const topLanguagesList = topLanguageData.map((language) => {
    return (
      <span key={language._id}>{language.name} ({language.length}) </span>
    );
  });
  const handleChange = (event, value) => {
    setPage(value);
  };

  return (
    <div className={classes.root}>
      <div className="top-panel">
        <div><label htmlFor="movies">Total Movies watched so far: {total} </label></div>
        <div><label htmlFor="directors">Most watched Director:</label> {topDirectorsList}</div>
        <div><label htmlFor="languages">Most watched Language:</label> {topLanguagesList}</div>
        <div><label htmlFor="year">Most watched Year:</label> {topYearsList}</div>
      </div>
      <div style={{ margin: 5, padding: 5 }}>
        <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
          {movieList}

        </Grid>
      </div>
      <div className="pagination-panel">
        <Pagination count={count} color="primary" onChange={handleChange} page={page} showFirstButton showLastButton />
      </div>
    </div>
  );
};
