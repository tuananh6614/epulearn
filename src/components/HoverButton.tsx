import React from 'react';
import styled from 'styled-components';

const HoverButton = () => {
  return (
    <StyledWrapper>
      <div className="button">
        <div className="box">C</div>
        <div className="box">L</div>
        <div className="box">I</div>
        <div className="box">C</div>
        <div className="box">K</div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    display: flex;
  }

  .box {
    width: 35px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    transition: all 0.8s;
    cursor: pointer;
    position: relative;
    background: rgb(58, 165, 253);
    overflow: hidden;
  }

  .box:before {
    content: "H";
    position: absolute;
    top: 0;
    background: #C195EBFF;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(100%);
    transition: transform 0.4s;
  }

  .box:nth-child(2)::before {
    transform: translateY(-100%);
    content: 'E';
  }

  .box:nth-child(3)::before {
    content: 'L';
  }

  .box:nth-child(4)::before {
    transform: translateY(-100%);
    content: 'L';
  }

  .box:nth-child(5)::before {
    content: 'O';
  }

  .button:hover .box:before {
    transform: translateY(0);
  }
`;

export default HoverButton;
