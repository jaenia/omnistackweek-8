import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
import './Main.css';

import api from '../services/api';

import logo from '../assets/logo.svg';
import dislike from '../assets/dislike.svg';
import like from '../assets/like.svg';
import itsamatch from '../assets/itsamatch.png';

export default function Main({ match }) {
    // Necessário para fazer o componente ter acesso às informações vindas do useEffect (Hooks).
    const [users, setUsers] = useState([]);

    const [matchDev, setMatchDev] = useState(null);

    // useEffect (Hooks):
    // - Neste caso, usado para buscar os desenvolvedores da api.
    // - Faz chamada à api assim que o componente é exibido em tela.
    // - Recebe a função que se deseja executar e quando se quer executar essa função. Para o
    //   quando, pode-se passar variáveis como parâmetro. Nesse caso, a função será
    //   executada quando essas variáveis forem alteradas.
    // - Se não passar nenhuma variável, a função é executada apenas uma vez dentro do componente.

    // React Hooks
    // faz chamada à api
    useEffect(() => {
        // a função vai buscar os dados dos devs na api e armazenar para poderem ser utilizados
        // na tela
        async function loadUsers() {
            const response = await api.get('/devs', {
                // envia o usuário logado como parâmetro para a rota, via header (como foi definido na rota)
                headers: { user: match.params.id },
            })

            // seta os usuários para serem exibidos na tela com o response que veio da api
            // quando o valor de um estado muda, todo o html é renderizado novamente
            setUsers(response.data);
        }

        loadUsers();
    }, [match.params.id]); // Será executado toda vez que o id do dev mudar.

    // conexão com o websocket
    useEffect(() => {
        const socket = io('http://localhost:3333', {
            query: { user: match.params.id }
        });

        socket.on('match', dev => {
            setMatchDev(dev);
        })
        
    }, [match.params.id]);

    async function handleLike(id) {
        await api.post(`/devs/${id}/likes`, null, {
            headers: { user: match.params.id },
        });

        // Filtra os usuários que possuem id diferente do passado como parâmetro para a função.
        // Evita que seja necessário atualizar a tela para visualizar a remoção
        // do usuário que recebeu like ou deslike.
        // Utilizado também na função handleDislike.
        setUsers(users.filter(user => user._id !== id));
    }

    async function handleDislike(id) {
        await api.post(`/devs/${id}/dislikes`, null, {
            headers: { user: match.params.id },
        });
        setUsers(users.filter(user => user._id !== id));
    }

    return (
        <div className="main-container">
            <Link to="/">
                <img src={logo} alt="Tindev"/>
            </Link>          
            { users.length > 0 ? (
                <ul>
                    {users.map(user => (
                        // O primeiro elemento depois do map precisa ter uma propriedade "key",
                        // utilizada pelo React para ele saber qual elemento é qual e evitar
                        // que a lista seja renderizada do zero sempre, melhorando a performance.
                        <li key={user._id}>
                            <img src={user.avatar} alt={user.name} />
                            <footer>
                                <strong>{user.name}</strong>
                                <p>{user.bio}</p>
                            </footer>

                            <div className="buttons">
                                <button type="button" onClick={() => handleDislike(user._id)}>
                                    <img src={dislike} alt="Dislike"/>
                                </button>
                                <button type="button" onClick={() => handleLike(user._id)}>
                                    <img src={like} alt="like"/>
                                </button>
                            </div>
                        </li> 
                    ))}      
                </ul>
            ) : (
                <div className="empty">Acabou :(</div>
            )}

            { matchDev && (
                <div className="match-container">
                    <img src={itsamatch} alt="It's a match"/>
                    <img className="avatar" src={matchDev.avatar} alt=""/>
                    <strong>{matchDev.name}</strong>
                    <p>{matchDev.bio}</p>
                    <button type="button" onClick={() => setMatchDev(null)}>FECHAR</button>
                </div>
            )}
                
        </div>
    )
}