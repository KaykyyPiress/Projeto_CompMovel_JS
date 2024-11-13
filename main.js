// Importação das bibliotecas
import * as React from 'react';
import { TextInput, Text, View, Button, StyleSheet, TouchableOpacity, FlatList, Image, Vibration } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator(); // Navegar pelas abas
const Stack = createStackNavigator(); // Permitir voltar pelas telas

const logo = require('./assets/logo.png'); // Logo

// Lista de produtos com suas respectivas imagens
const produtos = [
  { nome: "Hambúrguer", imagem: require('./assets/hamburguer.jpg') },
  { nome: "Batata Frita", imagem: require('./assets/batata.jpg') },
  { nome: "Refrigerante", imagem: require('./assets/refri.jpg') },
  { nome: "Suco", imagem: require('./assets/suco.jpg') },
  { nome: "Pizza", imagem: require('./assets/pizza.jpg') },
  { nome: "Coxinha", imagem: require('./assets/coxinha.jpg') }
];

// Input para cadastrar e logar usuário e senha
const InputField = ({ label, secure, onChange }) => (
  <>
    <Text>{label}</Text>
    <TextInput style={styles.borda} secureTextEntry={secure} onChangeText={onChange} />
  </>
);

class Principal extends React.Component {
  state = { usuario: '', senha: '' }; // Guarda o usuário e a senha

  // Confere senha e usuário digitados
  ler = async () => {
    try {
      const senha = await AsyncStorage.getItem(this.state.usuario);
      if (senha) {
        if (senha === this.state.senha) {
          await AsyncStorage.setItem('usuarioLogado', this.state.usuario);
          this.props.navigation.navigate('Pedidos');
        } else alert("Senha Incorreta!");
      } else alert("Usuário não foi encontrado!");
    } catch (erro) {
      console.log(erro);
    }
  };

  // Primeira tela, mostra a logo e pede para inserir o usuário e a senha
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
  state = { user: '', password: '' }; // Guarda o usuário e senha para cadastro

  // Grava o novo usuário no AsyncStorage
  gravar = async () => {
    try {
      const usuarioExistente = await AsyncStorage.getItem(this.state.user);
      if (usuarioExistente) { // Verifica se o usuário já existe  
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

  // Tela para cadastrar o usuário
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

// Botão de navegação para a tela de pedidos
const NavigationButton = ({ title, navigateTo }) => (
  <TouchableOpacity style={styles.botao} onPress={navigateTo}>
    <Text style={styles.botaoTexto}>{title}</Text>
  </TouchableOpacity>
);

class Pedidos extends React.Component {
  render() {
    return (
        //botões para criar e listar o pedido
      <View style={styles.container}>
        <NavigationButton title="Criar Pedido" navigateTo={() => this.props.navigation.navigate('Criar_Pedido')} />
        <NavigationButton title="Listar Pedidos" navigateTo={() => this.props.navigation.navigate('Listar_Pedidos')} />
      </View>
    );
  }
}

class Criar_Pedido extends React.Component {
    //guarda o nome do cliente, os produtos que foram anotas e o nome do usuário que logou
    state = { cliente: '', produtosSelecionados: [], usuarioLogado: '' };

  // Guarda o nome do usuário que logou
  async componentDidMount() {
    const usuarioLogado = await AsyncStorage.getItem('usuarioLogado');
    this.setState({ usuarioLogado });
  }

  // Adiciona ou remove produtos da lista de selecionados com base na ação
  selecionarProduto = (produto, action) => {
    Vibration.vibrate();
    this.setState((prevState) => {
      const produtosSelecionados = [...prevState.produtosSelecionados]; //guarda na variavel os produtos selecionados
      const index = produtosSelecionados.findIndex(item => item.nome === produto.nome); //guarda no index se o produto já foi selecionado ou não, retorna -1 se não foi

     //confere se o produto já foi adicionado a lista
      if (index >= 0) {
        const produtoSelecionado = produtosSelecionados[index];
        
        // incrementa ou decrementa a quantidade com base no que o usuário selecionar
        if (action === 'incrementa') {
          produtoSelecionado.quantidade += 1;
        } 
        
        else if (action === 'decrementa') {
          produtoSelecionado.quantidade -= 1;

        //remove o produto se a quantidade for zero
          if (produtoSelecionado.quantidade === 0) {
            produtosSelecionados.splice(index, 1);
          }
        }
        // adiciona o produto na lista com quantidade inicial de 1
      } else if (action === 'incrementa') {
        produtosSelecionados.push({ ...produto, quantidade: 1 });
      }

      return { produtosSelecionados };
    });
  };

  // Salva o pedido no AsyncStorage
  salvarPedido = async () => {
    Vibration.vibrate();
    // extrai as informações necessárias do estado atual: nome do cliente, produtos selecionados e usuário logado
    const { cliente, produtosSelecionados, usuarioLogado } = this.state;

    // Verifica se o nome do cliente foi inserido e se pelo menos um produto foi selecionado
    const pedidoValido = cliente && produtosSelecionados.length > 0;
    
    if (pedidoValido) {
      try {
        // recupera a lista de pedidos armazenada ou cria uma lista vazia se não houver pedido
        const pedidosSalvos = await AsyncStorage.getItem('pedidos');
        const listaPedidos = pedidosSalvos ? JSON.parse(pedidosSalvos) : [];
      
        // cria um novo pedido com os dados do cliente, usuário e produtos, e define o estado inicial como "pendente"
        const novoPedido = {
          cliente: cliente,
          usuario: usuarioLogado,
          produtos: produtosSelecionados,
          estado: 'pendente'
        };

        // adiciona o novo pedido à lista de pedidos existente
        listaPedidos.push(novoPedido);

        // Salva a lista de pedidos atualizada de volta no AsyncStorage
        await AsyncStorage.setItem('pedidos', JSON.stringify(listaPedidos));

        // Confirma ao usuário que o pedido foi salvo com sucesso e retorna à tela anterior
        alert(`Pedido para '${cliente}' adicionado como 'pendente'`);
        this.props.navigation.goBack();

      } catch (error) {
        console.error("Erro ao salvar o pedido:", error);
        alert("Erro ao salvar o pedido. Tente novamente.");
      }
    } else {
      alert("Por favor, insira o nome do cliente e selecione ao menos um produto.");
    }
  };

  // tela para criação de pedido
  render() {
    return (
      <View>
        <Text>Nome do Cliente:</Text>
        {/*colocar o nome do cliente*/}
        <TextInput 
          style={styles.borda2} 
          onChangeText={(cliente) => this.setState({ cliente })} 
          placeholder="Digite o nome do cliente" 
        />

        <Text>Selecione os Produtos:</Text>

        {/*exibe a lista com os produtos*/}
        <FlatList
          data={produtos} /*usa a lista de produtos que eu defini no começo*/
          keyExtractor={(item) => item.nome} /*define o nome do produto como uma chave para acessar ele*/
          renderItem={({ item }) => {
            const produtoSelecionado = this.state.produtosSelecionados.find(p => p.nome === item.nome); /*busca na lista ProdutosSelecionados se o produto já foi selecionado (item) */
            return (
              //coloca os produtos, as imagens e os botões + e -
              <View style={styles.produtoContainer}>
                <View style={styles.produtoItem}>
                  <Image source={item.imagem} style={{ width: 50, height: 50, marginRight: 10 }} />
                  <Text style={styles.produtoTexto}>{`${item.nome} - Qtd: ${produtoSelecionado?.quantidade || 0}`}</Text>
                </View>
                <View style={styles.produtoBotoes}>
                  <TouchableOpacity style={styles.botaodecrementar} onPress={() => this.selecionarProduto(item, 'decrementa')}>
                    <Text style={styles.botaodecrementartexto}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botaoincrementar} onPress={() => this.selecionarProduto(item, 'incrementa')}>
                    <Text style={styles.botaoincrementartexto}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
        <Button title="Criar Pedido" onPress={this.salvarPedido} />
      </View>
    );
  }
}

class Listar_Pedidos extends React.Component {
  render() {
    return (
      <View style = {styles.container} /* Mapeia os estados dos pedidos em uma lista de botões */>
        {['Pendente', 'Em Preparação', 'Concluído'].map(estado => (
          <NavigationButton
            key={estado} // Define o estado como a chave única para cada botão
            title={estado}  // Define o texto exibido no botão como o nome do estado
            navigateTo={() => this.props.navigation.navigate('Pedidos_Por_Estado', { estado: estado.toLowerCase() })}
          />// Define a navegação para a tela 'Pedidos_Por_Estado' com o estado selecionado
        ))}
      </View>
    );
  }
}

class Pedidos_Por_Estado extends React.Component {
  state = { pedidos: [] }; // define como vazio os pedidos

  async componentDidMount() {
    await this.carregarPedidos(); //procura se tem algum pedido
  }

  carregarPedidos = async () => {
    const { estado } = this.props.route.params; //pega o estado atual, se está pendente, em andamento entre outros
    const todosPedidos = JSON.parse(await AsyncStorage.getItem('pedidos')) || []; //pega os pedidos que estão no ASYNC
    this.setState({ pedidos: todosPedidos.filter(pedido => pedido.estado === estado) }); // faz um "filtro" para colocar cada estado no seu estado correspondente
  };

  alterarPedido = async (pedidoAtualizado) => {
    Vibration.vibrate();
    const pedidos = JSON.parse(await AsyncStorage.getItem('pedidos')) || []; //pega todos os pedidos do ASYNC
    const novosPedidos = pedidos.map(pedido => (pedido.cliente === pedidoAtualizado.cliente ? pedidoAtualizado : pedido)); //quando mudar o estado, vai atualizar a lista 
    await AsyncStorage.setItem('pedidos', JSON.stringify(novosPedidos)); //salva as modificações feitas
    this.carregarPedidos();
  };

  render() {
    const { pedidos } = this.state; //separa os pedidos por estados
    const { estado } = this.props.route.params; //mostra o estado selecionado

    return (
      <View>
        <Text style={styles.categoriaTitulo}>{`Pedidos - ${estado.charAt(0).toUpperCase() + estado.slice(1)}`}</Text> //Exibe o titulo do estado dos pedidos
        <FlatList
          data={pedidos} //guarda os pedidos como array
          keyExtractor={(item, index) => index.toString()} //define uma chave unica para cada item com base no índicie
          renderItem={({ item }) => ( //define como cada pedido será exibido
            <View style={styles.pedido}>
            //exibe o nome do cliente e do usuário que fez o pedido
              <Text style={styles.pedidoTitulo}>{`${item.cliente} (Pedido por: ${item.usuario})`}</Text> //exibe o nome do cliente e do usuário que fez o pedido
              <Text>{item.produtos.map(p => `${p.nome} (Qtd: ${p.quantidade})`).join(", ")}</Text> //exibe o nome e a quantidade de cada produto
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
            <Stack.Screen name="Criar_Pedido" component={Criar_Pedido} />
            <Stack.Screen name="Listar_Pedidos" component={Listar_Pedidos} />
            <Stack.Screen name="Pedidos_Por_Estado" component={Pedidos_Por_Estado} />
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
