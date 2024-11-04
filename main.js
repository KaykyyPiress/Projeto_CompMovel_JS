import * as React from 'react';
import { TextInput, Text, View, Button, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

class Principal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      usuario: undefined,
      senha: undefined
    }
  }

  render() {
    return (
      <View>
        <Text>{"Usuário:"}</Text>
        <TextInput onChangeText={(texto) => this.setState({ usuario: texto })}></TextInput>
        <Text>{"Senha:"}</Text>
        <TextInput onChangeText={(texto) => this.setState({ senha: texto })} secureTextEntry={true}></TextInput>
        <Button title="Logar" onPress={() => this.ler()}></Button>
      </View>
    )
  }

  async ler() {
    try {
      let senha = await AsyncStorage.getItem(this.state.usuario);
      if (senha != null) {
        if (senha == this.state.senha) {
          alert("Logado!!!");
          this.props.navigation.navigate('Lista de Compras');
        } else {
          alert("Senha Incorreta!");
        }
      } else {
        alert("Usuário não foi encontrado!");
      }
    } catch (erro) {
      console.log(erro);
    }
  }
}

class Cadastro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      password: undefined,
    }
  }

  async gravar() {
    try {
      await AsyncStorage.setItem(this.state.user, this.state.password);
      alert("Salvo com sucesso!!!")
    } catch (erro) {
      alert("Erro!")
    }
  }

  render() {
    return (
      <View>
        <Text>{"Cadastrar Usuário:"}</Text>
        <TextInput style={styles.borda} onChangeText={(texto) => this.setState({ user: texto })}></TextInput>
        <Text>{"Cadastrar Senha:"}</Text>
        <TextInput onChangeText={(texto) => this.setState({ password: texto })} secureTextEntry={true}></TextInput>
        <Button title="Cadastrar" onPress={() => this.gravar()} />
      </View>
    )
  }
}

// Lista de produtos pré-selecionados
const produtos = [
  { id: '1', nome: 'Arroz', imagem: require('./arroz.png') },

];

class ListaCompras extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listaCompras: [],
    };
  }

  componentDidMount() {
    this.recuperarLista();
  }

  async salvarLista(lista) {
    try {
      await AsyncStorage.setItem('@listaCompras', JSON.stringify(lista));
    } catch (erro) {
      console.log("Erro ao salvar a lista", erro);
    }
  }

  async recuperarLista() {
    try {
      const listaSalva = await AsyncStorage.getItem('@listaCompras');
      if (listaSalva !== null) {
        this.setState({ listaCompras: JSON.parse(listaSalva) });
      }
    } catch (erro) {
      console.log("Erro ao recuperar a lista", erro);
    }
  }

  adicionarItem = (produto) => {
    const { listaCompras } = this.state;
    const novaLista = [...listaCompras, produto];
    this.setState({ listaCompras: novaLista });
    this.salvarLista(novaLista);
  };

  renderProduto = ({ item }) => (
    <TouchableOpacity style={styles.produto} onPress={() => this.adicionarItem(item.nome)}>
      <Image source={item.imagem} style={styles.imagemProduto} />
      <Text style={styles.nomeProduto}>{item.nome}</Text>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ marginVertical: 20, fontSize: 18 }}>Selecione os produtos para a lista de compras:</Text>
        <FlatList
          data={produtos}
          renderItem={this.renderProduto}
          keyExtractor={(item) => item.id}
          numColumns={2}
        />
        <Text style={{ marginVertical: 20, fontSize: 18 }}>Sua Lista de Compras:</Text>
        {this.state.listaCompras.map((item, index) => (
          <Text key={index} style={styles.itemLista}>{item}</Text>
        ))}
      </View>
    );
  }
}

class App2 extends React.Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login Usuário" component={Principal} />
        <Stack.Screen name="Lista de Compras" component={ListaCompras} />
      </Stack.Navigator>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Login" component={App2}
            options={{
              tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="home-account" color={color} size={size} />), headerShown: false
            }}
          />
          <Tab.Screen name="Criar Usuário" component={Cadastro}
            options={{
              tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="account-details" color={color} size={size} />)
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    )
  }
}

export default App;

const styles = StyleSheet.create({
  borda: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
  produto: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
  },
  imagemProduto: {
    width: 80,
    height: 80,
  },
  nomeProduto: {
    marginTop: 5,
    fontSize: 16,
  },
  itemLista: {
    fontSize: 16,
    paddingVertical: 5,
  },
});
