import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 275,
    maxWidth: 400,
    margin: 'auto',
    textAlign: 'center',
    backgroundColor: theme.palette.success.light,
  },
  badge: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '& span': {
      width: 'auto',
      height: 'auto',
      borderRadius: '50%',
      padding: theme.spacing(1),
      fontWeight: 'bold',
      fontSize: 18,
    },
  },
  title: {
    fontWeight: 'bold',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  level: {
    fontSize: 72,
    fontWeight: 'bold',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  progress: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
  progressBar: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  nextLevel: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
    textTransform: 'none',
  },
}));

function EmployeeLevelIndicator({ level, progress, nextLevel }) {
  const classes = useStyles();

  const calculateNextLevelProgress = () => {
    const remaining = 100 - progress;
    return nextLevel ? remaining : 0;
  };

  const handleClick = () => {
    // handle button click here
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Badge
          className={classes.badge}
          badgeContent={level}
          max={999}
          color="primary"
        />
        <Typography className={classes.title} variant="h5">
          Level {level}
        </Typography>
        <Typography className={classes.level} variant="h1">
          {level}
        </Typography>
        <Typography className={classes.progress} variant="body1">
          {progress}% Complete
        </Typography>
        <LinearProgress
          className={classes.progressBar}
          variant="determinate"
          value={progress}
          color="secondary"
        />
        {nextLevel && (
          <Button
            className={classes.nextLevel}
            variant="contained"
            color="primary"
            onClick={handleClick}
          >
            Next Level: {nextLevel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default EmployeeLevelIndicator;