import React, { useRef, useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';

import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';

import api from '../../_services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../hooks/auth';
import getValidationErrors from '../../utils/getValidationErros';
import {
  Container,
  BackButton,
  Title,
  UserAvatarButton,
  UserAvatar,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const [image, setImage] = useState({ preview: '', file: '' });

  const { user, updateUser } = useAuth();

  const handleProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um email válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string().required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val) => !!val.length,
              then: Yup.string().required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), 'null'], 'Confirmação incorreta'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };
        const res = await api.put('/profile', formData);
        console.log('==>> /profile', res.data);
        updateUser(res.data);

        Alert.alert(
          'Perfil atualizando!',
          'Suas informações do perfil foram atualizados com sucesso!',
        );

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }

        Alert.alert(
          'Falha na atualização do perfil!',
          'Ocorreu uma falha ao tentar atualização do perfil, tente novamente!',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpadteAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Seleciona um Avatar',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar câmera',
        chooseFromLibraryButtonTitle: 'Escolha da galeria',
      },
      async (upload) => {
        if (upload.didCancel) {
          return;
        }

        if (upload.error) {
          Alert.alert('Erro ao atualizar seu avatar.');
          return;
        }

        if (!upload.uri) {
          return;
        }

        // const preview = { uri: `data:image/jpeg;base64, ${upload.data}` };

        // eslint-disable-next-line no-shadow
        let prefix;
        let ext;

        if (upload.fileName) {
          [prefix, ext] = upload.fileName.split('.');
          ext = ext.toLowerCase() === 'heic' ? 'jpg' : ext;
        } else {
          prefix = new Date().getTime();
          ext = 'jpg';
        }

        const file = {
          uri: upload.uri,
          type: upload.type,
          name: `${prefix}.${ext}`,
        };

        /*
        setImage({
          preview,
          file,
        }); */

        const data = new FormData();

        data.append('file', file);
        /*
        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: `file://${upload.uri}`,
        }); */

        try {
          console.log('data:', data);
          console.log('upload.fileName', upload.fileName);

          api.patch('users/avatar', data).then((apiRes) => {
            updateUser(apiRes.data);
            Alert.alert('Sucesso!', `Imagem alterada com sucesso.`);
          });

          /*
          if (profile.avatar === null) {
            setLoadingImage(true);
            dispatch(createImage({ data }));
            setLoadingImage(loading);
            return;
          }
          setLoadingImage(true);
          const avatar_id =
            profile.person.avatar === null ? '' : profile.person.avatar.id;
          data.append('id', avatar_id);

          const res = await api.put(`files/${avatar_id}`, data);
          dispatch(updateImage({ data: res.data }));
          setLoadingImage(false); */
        } catch (error) {
          // setLoadingImage(false);
          Alert.alert(
            'Atenção!',
            `Não foi possivel atualizar a imagem, tente novamente.`,
          );
        }
      },
    );
  }, [updateUser]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <BackButton onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={20} color="#fff" />
            </BackButton>

            <UserAvatarButton onPress={handleUpadteAvatar}>
              <UserAvatar
                source={{
                  uri: user.avatar_url
                    ? `${user.avatar_url}`
                    : `https://api.adorable.io/avatar/50/${user.name}.png`,
                }}
              />
            </UserAvatarButton>

            <View>
              <Title>Meu Perfil</Title>
            </View>
            <Form initialData={user} ref={formRef} onSubmit={handleProfile}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />
              <Input
                ref={emailInputRef}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                name="old_password"
                containerStyle={{ marginTop: 16 }}
                icon="lock"
                placeholder="Senha atual"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Nova senha"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Confirmar mudanças
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
