// ----------------------------------------------------------------------

const customBox = {
  box_container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #fff',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    maxHeight: 680,
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: ' 10px',
      height: '10px'
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
      borderRadius: '5px',
      margin: '5px'
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: ' #888',
      borderRadius: '5px',
      border: 'solid 2px #888'
    },

    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#888',
      borderRadius: '5px',
      border: 'solid 2px #888'
    },

    '@media only screen and (max-width: 600px)': {
      width: 340,
      maxHeight: 670
    },
    /* Small devices (portrait tablets and large phones, 600px and up) */
    '@media only screen and (min-width: 600px)': {
      width: 400
    },
    /* Medium devices (landscape tablets, 768px and up) */
    '@media only screen and (min-width: 768px)': {
      width: 500
    },
    /* Large devices (laptops/desktops, 992px and up) */
    '@media only screen and (min-width: 992px)': {
      width: 600
    },
    /* Extra large devices (large laptops and desktops, 1200px and up) */
    '@media only screen and (min-width: 1200px)': {
      width: 600
    }
  }
};

export default customBox;
