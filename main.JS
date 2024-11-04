import * as React from 'react';
import { TextInput, Text, View, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

class Principal extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      usuario: undefined,
      senha: undefined
    }
  }

  render(){
    return(
    <View>
      <Text>{"Usuário:"}</Text>
      <TextInput onChangeText={(texto)=>this.setState({usuario: texto})}></TextInput>
      <Text>{"Senha:"}</Text>
      <TextInput onChangeText={(texto)=>this.setState({senha: texto})}></TextInput>
      <Button title="Logar" onPress={()=>this.ler()}></Button>
    </View>
    )
  }


  async ler(){
    try{
      let senha = await AsyncStorage.getItem(this.state.usuario);
      if(senha != null){
        if(senha == this.state.senha){
          alert("Logado!!!");
          this.props.navigation.navigate('Filmes');
        }else{
          alert("Senha Incorreta!");
        }
      }else{
        alert("Usuário não foi encontrado!");
      }
    }catch(erro){
      console.log(erro);
    }
  }
}

class Cadastro extends React.Component{
  constructor(props){
    super(props);
    this.state={
      user: undefined,
      password: undefined,

    }

  }

  async gravar(){
    try{
      await AsyncStorage.setItem(this.state.user, this.state.password);
      alert("Salvo com sucesso!!!")
    }catch(erro){
      alert("Erro!")
    }
  }

  render(){
    return(
    <View>
      <Text>{"Cadastrar Usuário:"}</Text>
      <TextInput style={styles.borda} onChangeText={(texto)=>this.setState({user: texto})}></TextInput>
      <Text>{"Cadastrar Senha:"}</Text>
      <TextInput onChangeText={(texto)=>this.setState({password: texto})}></TextInput>
      <Button title="Cadastrar" onPress={()=>this.gravar()}/>
    </View>
    )
  }
}

class Filmes extends React.Component{

  render(){
    return(
      <View>
        <TouchableOpacity 
          style={styles.botao} 
          onPress={() => this.props.navigation.navigate('Senhor dos Anéis')}
        >
          <Text style={styles.botaoTexto}>Senhor dos Anéis</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.botao} 
          onPress={() => this.props.navigation.navigate('Auto da Compadecida')}
        >
          <Text style={styles.botaoTexto}>Auto da Compadecida</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => this.props.navigation.navigate('Velozes e Furiosos 9')}>
        <Text style={styles.botaoTexto}>Velozes e Furiosos 9</Text>
        </TouchableOpacity>
      </View>  
    )
  }
}
class sinopseSenhor extends React.Component{

  render(){
    return(
      <View>
        <Text style={styles.texxto}> Senhor dos Anéis é uma história que se passa na Terra Média, um mundo imaginário criado pelo autor. A história segue a jornada de um hobbit chamado Frodo Bolseiro, que é encarregado de destruir o Um Anel, um artefato mágico criado pelo vilão Sauron para controlar o mundo. O anel foi dado a Frodo por seu tio, Bilbo Bolseiro, e com a ajuda do mago Gandalf, Frodo descobre que a jóia é mágica e seus poderes podem ter consequências terríveis para quem usar e para o resto do mundo. </Text>
      </View>
    )
  }
}

class sinopseAuto extends React.Component{
  render(){
    return(
      <View>
        <Text style={styles.texxto} > O Auto da Compadecida consegue o equilíbrio perfeito entre a tradição popular e a elaboração literária ao recriar para o teatro episódios registrados na tradição popular do cordel. É uma peça teatral em forma de Auto em 3 atos, escrita em 1955 pelo autor paraibano Ariano Suassuna.
        </Text>
      </View>
    )
  }
}

class sinopseVeloz extends React.Component{
  render(){
    return(
      <View>
      <Text style={styles.texxto}>
      Em Velozes & Furiosos 9, dois anos após o confronto com a ciber-terrorista Cipher - no filme Velozes e Furiosos 8 - Dominic Toretto (Vin Diesel) - agora aposentado - e Letty (Michelle Rodriguez) vivem uma vida pacata ao lado de seu filho Brian. Mas a vida dos dois é logo interrompida quando Roman Pearce, Tej Parker e Ramsey chegam com notícias de que, pouco depois de prender Cipher (Charlize Theron), o avião de Mr. Nobody foi atacado por agentes e sequestraram Cipher, precisando da ajuda dele para investigar mais afundo. Acompanhando eles em uma missão, o grupo logo acha nos escombros parte de um dispositivo chamado Projeto Aries. A calmaria é dissipada quando o irmão desaparecido de Dom retorna e rouba o dispositivo deles com um grupo altamente treinado. Jakob (John Cena), um assassino habilidoso e excelente motorista, está trabalhando ao lado de Cipher. Para enfrentá-los, Toretto vai precisar reunir sua equipe novamente, inclusive Han (Sung Kang), que todos acreditavam estar morto.
      </Text>
      </View>
    )
  }
}

class App2 extends React.Component{

  render(){
    return(
        <Stack.Navigator>
          <Stack.Screen name="Login Usuário" component={Principal} />
          <Stack.Screen name="Filmes" component={Filmes} />
          <Stack.Screen name="Senhor dos Anéis" component={sinopseSenhor} />
          <Stack.Screen name= "Auto da Compadecida" component={sinopseAuto} />
          <Stack.Screen name= "Velozes e Furiosos 9" component={sinopseVeloz}/>
        </Stack.Navigator>
    )
  }
}

class App extends React.Component {

  render() {
    return(
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Login" component={App2} 
          options={{
            tabBarIcon: ({color, size}) => (<MaterialCommunityIcons name="home-account" color={color} size={size}/>), headerShown: false
          }}
        />
        <Tab.Screen name="Criar Usuário" component={Cadastro}
          options={{
            tabBarIcon: ({color, size}) => (<MaterialCommunityIcons name="account-details" color={color} size={size}/>)
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    )
  }
}

export default App;

const styles = StyleSheet.create({
  botao: {
    width: 200,
    height: 50,
    backgroundColor: 'blue', // Cor de fundo do botão
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5, // Bordas arredondadas
    marginVertical: 15,

  },
  botaoTexto: {
    color: 'white', // Cor do texto
    fontSize: 18,
    fontWeight: 'bold',
  },

  texxto:{
    fontFamily: 'arial',
    fontSize: 15,
    textAlign: 'justify',
  },

  borda: {
    borderWidth: 1, // Define a largura da borda
    borderColor: 'gray', // Define a cor da borda
    padding: 10,
  }
})

