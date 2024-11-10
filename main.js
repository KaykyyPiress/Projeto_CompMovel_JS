import * as React from 'react';
import { TextInput, Text, View, Button, StyleSheet, TouchableOpacity, Picker, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
          this.props.navigation.navigate('Filmes');
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

class Filmes extends React.Component {
  render() {
    return (
      <View>
        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('CriarTarefa')}>
          <Text style={styles.botaoTexto}>Criar Tarefa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('ListarTarefas')}>
          <Text style={styles.botaoTexto}>Listar Tarefas</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class CriarTarefa extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      descricao: '',
      categoria: 'em aberto'
    };
  }

  salvarTarefa = async () => {
    const { descricao, categoria } = this.state;
    if (descricao) {
      const novaTarefa = { descricao, categoria };
      const tarefas = JSON.parse(await AsyncStorage.getItem('tarefas')) || [];
      tarefas.push(novaTarefa);
      await AsyncStorage.setItem('tarefas', JSON.stringify(tarefas));
      alert(`Tarefa '${descricao}' adicionada em '${categoria}'`);
      this.props.navigation.goBack();
    } else {
      alert("Por favor, insira uma descrição para a tarefa.");
    }
  };

  render() {
    return (
      <View>
        <Text>Descrição da Tarefa:</Text>
        <TextInput
          style={styles.borda}
          onChangeText={(texto) => this.setState({ descricao: texto })}
          placeholder="Digite a descrição da tarefa"
        />

        <Text>Categoria:</Text>
        <Picker
          selectedValue={this.state.categoria}
          onValueChange={(itemValue) => this.setState({ categoria: itemValue })}
        >
          <Picker.Item label="Em Aberto" value="em aberto" />
          <Picker.Item label="Em Andamento" value="em andamento" />
          <Picker.Item label="Feito" value="feito" />
        </Picker>

        <Button title="Salvar Tarefa" onPress={this.salvarTarefa} />
      </View>
    );
  }
}

class ListarTarefas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tarefas: [],
      categoriaSelecionada: 'em aberto'
    };
  }

  async componentDidMount() {
    await this.carregarTarefas();
  }

  carregarTarefas = async () => {
    const tarefas = JSON.parse(await AsyncStorage.getItem('tarefas')) || [];
    this.setState({ tarefas });
  };

  filtrarTarefas = (categoria) => {
    this.setState({ categoriaSelecionada: categoria });
  };

  render() {
    const { tarefas, categoriaSelecionada } = this.state;
    const tarefasFiltradas = tarefas.filter(tarefa => tarefa.categoria === categoriaSelecionada);

    return (
      <View>
        <TouchableOpacity style={styles.botao} onPress={() => this.filtrarTarefas('em aberto')}>
          <Text style={styles.botaoTexto}>Em Aberto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => this.filtrarTarefas('em andamento')}>
          <Text style={styles.botaoTexto}>Em Andamento</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => this.filtrarTarefas('feito')}>
          <Text style={styles.botaoTexto}>Feito</Text>
        </TouchableOpacity>

        <FlatList
          data={tarefasFiltradas}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarefa}>
              <Text>{item.descricao}</Text>
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
        <Stack.Screen name="Filmes" component={Filmes} />
        <Stack.Screen name="CriarTarefa" component={CriarTarefa} />
        <Stack.Screen name="ListarTarefas" component={ListarTarefas} />
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
  tarefa: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gray'
  },
  borda: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10
  }
});
