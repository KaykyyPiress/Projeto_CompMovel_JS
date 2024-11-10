import * as React from 'react';
import { Text, View, Button, StyleSheet, TouchableOpacity, Picker, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const produtos = ["Hambúrguer", "Batata Frita", "Refrigerante", "Suco", "Pizza", "Coxinha"]; // Lista fixa de produtos

class Principal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usuario: undefined,
      senha: undefined
    };
  }

  render() {
    return (
      <View>
        <Text>{"Usuário:"}</Text>
        <TextInput onChangeText={(texto) => this.setState({ usuario: texto })}></TextInput>
        <Text>{"Senha:"}</Text>
        <TextInput onChangeText={(texto) => this.setState({ senha: texto })}></TextInput>
        <Button title="Logar" onPress={() => this.ler()}></Button>
      </View>
    );
  }

  async ler() {
    try {
      let senha = await AsyncStorage.getItem(this.state.usuario);
      if (senha != null) {
        if (senha == this.state.senha) {
          alert("Logado!!!");
          this.props.navigation.navigate('Pedidos');
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
      password: undefined
    };
  }

  async gravar() {
    try {
      await AsyncStorage.setItem(this.state.user, this.state.password);
      alert("Salvo com sucesso!!!");
    } catch (erro) {
      alert("Erro!");
    }
  }

  render() {
    return (
      <View>
        <Text>{"Cadastrar Usuário:"}</Text>
        <TextInput style={styles.borda} onChangeText={(texto) => this.setState({ user: texto })}></TextInput>
        <Text>{"Cadastrar Senha:"}</Text>
        <TextInput onChangeText={(texto) => this.setState({ password: texto })}></TextInput>
        <Button title="Cadastrar" onPress={() => this.gravar()} />
      </View>
    );
  }
}

class Pedidos extends React.Component {
  render() {
    return (
      <View>
        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('CriarPedido')}>
          <Text style={styles.botaoTexto}>Criar Pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('ListarPedidos')}>
          <Text style={styles.botaoTexto}>Listar Pedidos</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class CriarPedido extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      produtoSelecionado: produtos[0]
    };
  }

  salvarPedido = async () => {
    const { produtoSelecionado } = this.state;
    const novoPedido = { titulo: produtoSelecionado, estado: 'pendente' };
    const pedidos = JSON.parse(await AsyncStorage.getItem('pedidos')) || [];
    pedidos.push(novoPedido);
    await AsyncStorage.setItem('pedidos', JSON.stringify(pedidos));
    alert(`Pedido '${produtoSelecionado}' adicionado como 'pendente'`);
    this.props.navigation.goBack();
  };

  render() {
    return (
      <View>
        <Text>Selecione o Produto:</Text>
        <Picker
          selectedValue={this.state.produtoSelecionado}
          onValueChange={(itemValue) => this.setState({ produtoSelecionado: itemValue })}
        >
          {produtos.map((produto, index) => (
            <Picker.Item key={index} label={produto} value={produto} />
          ))}
        </Picker>

        <Button title="Criar Pedido" onPress={this.salvarPedido} />
      </View>
    );
  }
}

class ListarPedidos extends React.Component {
  render() {
    return (
      <View>
        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('PedidosPorEstado', { estado: 'pendente' })}>
          <Text style={styles.botaoTexto}>Pendente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('PedidosPorEstado', { estado: 'em preparação' })}>
          <Text style={styles.botaoTexto}>Em Preparação</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('PedidosPorEstado', { estado: 'concluído' })}>
          <Text style={styles.botaoTexto}>Concluído</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class PedidosPorEstado extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pedidos: []
    };
  }

  async componentDidMount() {
    const { estado } = this.props.route.params;
    const todosPedidos = JSON.parse(await AsyncStorage.getItem('pedidos')) || [];
    const pedidosFiltrados = todosPedidos.filter(pedido => pedido.estado === estado);
    this.setState({ pedidos: pedidosFiltrados });
  }

  render() {
    const { pedidos } = this.state;
    const { estado } = this.props.route.params;

    return (
      <View>
        <Text style={styles.categoriaTitulo}>{`Pedidos - ${estado.charAt(0).toUpperCase() + estado.slice(1)}`}</Text>
        <FlatList
          data={pedidos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.pedido}>
              <Text style={styles.pedidoTitulo}>{item.titulo}</Text>
            </View>
          )}
        />
      </View>
    );
  }
}

class App2 extends React.Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login Usuário" component={Principal} />
        <Stack.Screen name="Pedidos" component={Pedidos} />
        <Stack.Screen name="CriarPedido" component={CriarPedido} />
        <Stack.Screen name="ListarPedidos" component={ListarPedidos} />
        <Stack.Screen name="PedidosPorEstado" component={PedidosPorEstado} />
      </Stack.Navigator>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Login"
            component={App2}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home-account" color={color} size={size} />
              ),
              headerShown: false
            }}
          />
          <Tab.Screen
            name="Criar Usuário"
            component={Cadastro}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account-details" color={color} size={size} />
              )
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  botao: {
    width: 200,
    height: 50,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 15
  },
  botaoTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  pedido: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gray'
  },
  pedidoTitulo: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  categoriaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10
  },
  borda: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10
  }
});
