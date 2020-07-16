import { Platform } from 'react-native';

import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px ${Platform.OS === 'android' ? 150 : 40}px;
  position: relative;
`;

export const BackButton = styled.TouchableOpacity`
  margin-top: 190px;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0;
`;

export const UserAvatarButton = styled.TouchableOpacity`
  margin-top: 0px;
  margin-bottom: 34px;
`;

export const UserAvatar = styled.Image`
  top: 30px;
  width: 76px;
  height: 76px;
  border-radius: 38px;

  align-self: center;
`;
