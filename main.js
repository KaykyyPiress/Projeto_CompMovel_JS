import * as React from 'react';
import { TextInput, Text, View, Button, StyleSheet, TouchableOpacity, FlatList, Image, Vibration } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const logo = require('./assets/logo.png');

const produtos = [
  { nome: "Hambúrguer", imagem: require('./assets/hamburguer.jpg') },
  { nome: "Batata Frita", imagem: require('./assets/batata.jpg') },
  { nome: "Refrigerante", imagem: require('./assets/refri.jpg') },
  { nome: "Suco", imagem: require('./assets/suco.jpg') },
  { nome: "Pizza", imagem: require('./assets/pizza.jpg') },
  { nome: "Coxinha", imagem: require('./assets/coxinha.jpg') }
];

const InputField = ({ label, secure, onChange }) => (
  <>
    <Text>{label}</Text>
    <TextInput style={styles.borda} secureTextEntry={secure} onChangeText={onChange} />
  </>
);

class Principal extends React.Component {
  state = { usuario: '', senha: '' };

  ler = async () => {
    try {
      const senha = await AsyncStorage.getItem(this.state.usuario);
      if (senha) {
        if (senha === this.state.senha) {
          await AsyncStorage.setItem('usuarioLogado', this.state.usuario);
          alert("Logado!!!");
          this.props.navigation.navigate('Pedidos');
        } else alert("Senha Incorreta!");
      } else alert("Usuário não foi encontrado!");
    } catch (erro) {
      console.log(erro);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <InputField label="Usuário:" onChange={(usuario) => this.setState({ usuario })} />
        <InputField label="Senha:" secure onChange={(senha) => this.setState({ senha })} />
        <TouchableOpacity style={styles.botaologin} onPress={() => { Vibration.vibrate(); this.ler(); }}>
          <Text style={styles.botaoTexto}> Logar </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class Cadastro extends React.Component {
  state = { user: '', password: '' };

  gravar = async () => {
    try {
      const usuarioExistente = await AsyncStorage.getItem(this.state.user);
      if (usuarioExistente) {
        alert("Usuário já existe! Tente um nome diferente.");
      } else {
        await AsyncStorage.setItem(this.state.user, this.state.password);
        alert("Salvo com sucesso!!!");
      }
    } catch (erro) {
      alert("Erro ao salvar!");
      console.log(erro);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <InputField label="Cadastrar Usuário:" onChange={(user) => this.setState({ user })} />
        <InputField label="Cadastrar Senha:" secure onChange={(password) => this.setState({ password })} />
        <Button title="Cadastrar" onPress={() => { Vibration.vibrate(); this.gravar(); }} />
      </View>
    );
  }
}

const NavigationButton = ({ title, navigateTo }) => (
  <TouchableOpacity style={styles.botao} onPress={navigateTo}>
    <Text style={styles.botaoTexto}>{title}</Text>
  </TouchableOpacity>
);

class Pedidos extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <NavigationButton title="Criar Pedido" navigateTo={() => this.props.navigation.navigate('CriarPedido')} />
        <NavigationButton title="Listar Pedidos" navigateTo={() => this.props.navigation.navigate('ListarPedidos')} />
      </View>
    );
  }
}

class CriarPedido extends React.Component {
  state = { cliente: '', produtosSelecionados: [], usuarioLogado: '' };

  async componentDidMount() {
    const usuarioLogado = await AsyncStorage.getItem('usuarioLogado');
    this.setState({ usuarioLogado });
  }

  selecionarProduto = (produto, action) => {
    Vibration.vibrate();
    this.setState((prevState) => {
      const produtosSelecionados = prevState.produtosSelecionados.slice();
      const index = produtosSelecionados.findIndex(item => item.nome === produto.nome);

      if (index >= 0) {
        if (action === 'increment') produtosSelecionados[index].quantidade += 1;
        else if (produtosSelecionados[index].quantidade > 1) produtosSelecionados[index].quantidade -= 1;
        else produtosSelecionados.splice(index, 1);
      } else if (action === 'increment') produtosSelecionados.push({ ...produto, quantidade: 1 });

      return { produtosSelecionados };
    });
  };

  salvarPedido = async () => {
    Vibration.vibrate();
    const { cliente, produtosSelecionados, usuarioLogado } = this.state;
    if (cliente && produtosSelecionados.length) {
      const pedidos = JSON.parse(await AsyncStorage.getItem('pedidos')) || [];
      pedidos.push({ cliente, usuario: usuarioLogado, produtos: produtosSelecionados, estado: 'pendente' });
      await AsyncStorage.setItem('pedidos', JSON.stringify(pedidos));
      alert(`Pedido para '${cliente}' adicionado como 'pendente'`);
      this.props.navigation.goBack();
    } else alert("Por favor, insira o nome do cliente e selecione ao menos um produto.");
  };

  render() {
    return (
      <View>
        <Text>Nome do Cliente:</Text>
        <TextInput style={styles.borda2} onChangeText={(cliente) => this.setState({ cliente })} placeholder="Digite o nome do cliente" />

        <Text>Selecione os Produtos:</Text>
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.nome}
          renderItem={({ item }) => {
            const produtoSelecionado = this.state.produtosSelecionados.find(p => p.nome === item.nome);
            return (
              <View style={styles.produtoContainer}>
                <TouchableOpacity
                  style={styles.produtoItem}
                  onPress={() => !produtoSelecionado && this.selecionarProduto(item, 'increment')}
                >
                  <Image source={item.imagem} style={{ width: 50, height: 50, marginRight: 10 }} />
                  <Text style={styles.produtoTexto}>{`${item.nome} - Qtd: ${produtoSelecionado?.quantidade || 0}`}</Text>
                </TouchableOpacity>

                {produtoSelecionado && (
                  <View style={styles.produtoBotoes}>
                    <TouchableOpacity style={styles.botaodecrementar} onPress={() => this.selecionarProduto(item, 'decrement')}>
                      <Text style={styles.botaodecrementartexto}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botaoincrementar} onPress={() => this.selecionarProduto(item, 'increment')}>
                      <Text style={styles.botaoincrementartexto}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
        <Button title="Criar Pedido" onPress={this.salvarPedido} />
      </View>
    );
  }
}

class ListarPedidos extends React.Component {
  render() {
    return (
      <View>
        {['Pendente', 'Em Preparação', 'Concluído'].map(estado => (
          <NavigationButton
            key={estado}
            title={estado}
            navigateTo={() => this.props.navigation.navigate('PedidosPorEstado', { estado: estado.toLowerCase() })}
          />
        ))}
      </View>
    );
  }
}

class PedidosPorEstado extends React.Component {
  state = { pedidos: [] };

  async componentDidMount() {
    await this.carregarPedidos();
  }

  carregarPedidos = async () => {
    const { estado } = this.props.route.params;
    const todosPedidos = JSON.parse(await AsyncStorage.getItem('pedidos')) || [];
    this.setState({ pedidos: todosPedidos.filter(pedido => pedido.estado === estado) });
  };

  alterarPedido = async (pedidoAtualizado) => {
    Vibration.vibrate();
    const pedidos = JSON.parse(await AsyncStorage.getItem('pedidos')) || [];
    const novosPedidos = pedidos.map(pedido => (pedido.cliente === pedidoAtualizado.cliente ? pedidoAtualizado : pedido));
    await AsyncStorage.setItem('pedidos', JSON.stringify(novosPedidos));
    this.carregarPedidos();
  };

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
              <Text style={styles.pedidoTitulo}>{`${item.cliente} (Pedido por: ${item.usuario})`}</Text>
              <Text>{item.produtos.map(p => `${p.nome} (Qtd: ${p.quantidade})`).join(", ")}</Text>
              {item.estado === 'pendente' && (
                <Button title="Preparar" onPress={() => this.alterarPedido({ ...item, estado: 'em preparação' })} />
              )}
              {item.estado === 'em preparação' && (
                <Button title="Concluir" onPress={() => this.alterarPedido({ ...item, estado: 'concluído' })} />
              )}
              <Button title="Excluir" color="red" onPress={() => this.alterarPedido({ ...item, estado: 'excluído' })} />
            </View>
          )}
        />
      </View>
    );
  }
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Login" component={() => (
          <Stack.Navigator>
            <Stack.Screen name="Login Usuário" component={Principal} />
            <Stack.Screen name="Pedidos" component={Pedidos} />
            <Stack.Screen name="CriarPedido" component={CriarPedido} />
            <Stack.Screen name="ListarPedidos" component={ListarPedidos} />
            <Stack.Screen name="PedidosPorEstado" component={PedidosPorEstado} />
          </Stack.Navigator>
        )} options={{
          tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="home-account" color={color} size={size} />),
          headerShown: false
        }} />
        <Tab.Screen name="Criar Usuário" component={Cadastro} options={{
          tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="account-details" color={color} size={size} />)
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 50 },
  logo: { width: 230, height: 100, marginBottom: 20 },
  botao: { width: 200, height: 50, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginVertical: 15 },
  botaologin: { width: 100, height: 35, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  botaoTexto: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  pedido: { padding: 10, borderBottomWidth: 1, borderColor: 'gray' },
  pedidoTitulo: { fontSize: 16, fontWeight: 'bold' },
  categoriaTitulo: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  borda: { borderWidth: 2, borderColor: 'black', padding: 2, marginBottom: 10, width: '50%' },
  borda2: { borderWidth: 2, borderColor: 'black', padding: 2, marginBottom: 10, width: '95%' },
  produtoContainer: { flexDirection: 'row', alignItems: 'center', width: '93%' },
  produtoItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: 'gray', width: '90%' },
  produtoTexto: { fontSize: 16 },
  produtoBotoes: { flexDirection: 'row', alignItems: 'center' },
  botaodecrementar: { paddingHorizontal: 10 },
  botaodecrementartexto: { fontSize: 20, color: 'red' },
  botaoincrementar: { paddingHorizontal: 10 },
  botaoincrementartexto: { fontSize: 20, color: 'green' }
});
