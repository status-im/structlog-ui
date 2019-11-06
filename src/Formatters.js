import React from 'react';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import stripAnsi from 'strip-ansi';

const LogFormatter = ({ onClick }) => {
  return (props) => {
    return (
      <span onClick={onClick(props)}>
        {stripAnsi(props.value)}
      </span>
    )
  }
};

const LogTypeProvider = (props) => {
  console.dir(props)
  return (
    <DataTypeProvider
      formatterComponent={LogFormatter(props)}
      {...props}
    />
  )
}

const StepFormatter = ({onClick}) => {
  return (props) => {
    return (
      <span onClick={onClick(props)}>
        {stripAnsi(props.value)}
      </span>
    );
  }
}

const StepTypeProvider = (props) => {
  return (
    <DataTypeProvider
      formatterComponent={StepFormatter(props)}
      {...props}
    />
  )
}

export {
  LogFormatter,
  LogTypeProvider,
  StepFormatter,
  StepTypeProvider
}