import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from 'amn-ui-core';

interface NoDataPlaceholderProps {
  iconSrc: string;
  altText: string;
  message: React.ReactNode;  // Allow JSX or React elements
}

const useStyles = makeStyles()((theme: Theme) => ({
  wrapper: {
    height: '88vh',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #CCCCCC',
    background: theme.palette.framework.system.backgroundLightGrey,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    textAlign: 'center',
    padding: '20px',
    position: 'relative',
    top: '-2rem',
  },
  image: {
    width: '175px',
    marginBottom: '20px',
  },
  text: {
    color: theme.palette.framework.system.charcoal,
    fontSize: '14px',
    lineHeight: '1.5',
    fontStyle: 'italic',
    fontWeight: 'normal',
    margin: 0,
  },
}));

const NoDataPlaceholder: React.FC<NoDataPlaceholderProps> = ({ iconSrc, altText, message }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>
        <img src={iconSrc} alt={altText} className={classes.image} />
        <div className={classes.text}>{message}</div>  {/* Render message here as JSX */}
      </div>
    </div>
  );
};

export default NoDataPlaceholder;
