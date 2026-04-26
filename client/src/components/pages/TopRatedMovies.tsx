import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { styled } from '@mui/material/styles';
import axiosConfig from '../../helper/axiosConfig';
import { GET_TOP_RATED_MOVIE_URL } from '../../helper/config';
import type { ChangeEvent, MouseEvent } from 'react';
import { Box, FormControlLabel, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Toolbar, Typography } from '@mui/material';

// Represents a single movie row in the table
export interface TopRatedMovie {
  name: string;
  year: number;
  imdb: number;
  rottenTomatoes: number;
}

// Represents a table header cell
export interface HeadCell {
  id: keyof TopRatedMovie;
  numeric: boolean;
  disablePadding: boolean;
  label: string;
  minWidth?: number;
}

// Props for EnhancedTableHead component
export interface EnhancedTableHeadProps {
  order: 'asc' | 'desc';
  orderBy: keyof TopRatedMovie;
  onRequestSort: (event: MouseEvent<unknown>, property: keyof TopRatedMovie) => void;
  numSelected: number;
  rowCount: number;
}

// Props for EnhancedTableToolbar component
export interface EnhancedTableToolbarProps {
  numSelected: number;
}

const descendingComparator = (a: TopRatedMovie, b: TopRatedMovie, orderBy: keyof TopRatedMovie) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order: 'asc' | 'desc', orderBy: keyof TopRatedMovie) =>
  order === 'desc'
    ? (a: TopRatedMovie, b: TopRatedMovie) => descendingComparator(a, b, orderBy)
    : (a: TopRatedMovie, b: TopRatedMovie) => -descendingComparator(a, b, orderBy);

const stableSort = (array: TopRatedMovie[], comparator: (a: TopRatedMovie, b: TopRatedMovie) => number) => {
  const stabilizedThis = array.map((el: TopRatedMovie, index: number) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const headCells: HeadCell[] = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name', minWidth: 300 },
  { id: 'year', numeric: true, disablePadding: false, label: 'Year' },
  { id: 'imdb', numeric: true, disablePadding: false, label: 'IMDB Rating (10)' },
  { id: 'rottenTomatoes', numeric: true, disablePadding: false, label: 'Rotten Tomatoes (%)' }
];

const EnhancedTableHead = (props: EnhancedTableHeadProps): JSX.Element => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof TopRatedMovie) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'center' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'desc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <StyledVisuallyHidden>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </StyledVisuallyHidden>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const EnhancedTableToolbar = (): JSX.Element => {
  return (
    <Toolbar>
      <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
        Top rated movies
      </Typography>
    </Toolbar>
  );
};

const StyledBox = styled(Box)(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledVisuallyHidden = styled('span')(() => ({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1
}));

export const TopRatedMovies = (): JSX.Element => {
  const [topMovieList, setTopMovieList] = useState<TopRatedMovie[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof TopRatedMovie>('name');
  const [selected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (event: MouseEvent<unknown>, property: keyof TopRatedMovie) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, topMovieList.length - page * rowsPerPage);

  useEffect(() => {
    const topMovieUrl = axiosConfig.get(`${GET_TOP_RATED_MOVIE_URL}`);
    Promise.all([topMovieUrl])
      .then((responses) => {
        setTopMovieList(responses[0].data);
      })
      .catch((errors) => {
        console.log(errors);
      });
    return () => {
      setTopMovieList([]);
    };
  }, []);

  return (
    <StyledBox>
      <Paper sx={{ width: '75%' }}>
        <EnhancedTableToolbar />
        <TableContainer>
          <Table
            stickyHeader
            sx={{ minWidth: '400px' }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={topMovieList.length}
            />
            <TableBody>
              {stableSort(topMovieList, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: TopRatedMovie, index: number) => {
                  return (
                    <TableRow key={index}>
                      <TableCell align="left">{row.name}</TableCell>
                      <TableCell align="center">{row.year}</TableCell>
                      <TableCell align="center">{row.imdb}</TableCell>
                      <TableCell align="center">{row.rottenTomatoes}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={topMovieList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </StyledBox>
  );
};
