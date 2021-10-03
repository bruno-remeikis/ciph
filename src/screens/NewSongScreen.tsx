import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, ViewStyle } from 'react-native';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Services
import SongService from '../services/SongService';
import ArtistService from '../services/ArtistService';
import SongArtistService from '../services/SongArtistService';

// Models
import { Artist } from '../models/entities/Artist';

// Utils
import { colors, opacities, sizes } from '../utils/consts';

// Contexts
import { useUpdated } from '../contexts/Updated';

const NewSongScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONTEXTS ----------

    const { setUpdated } = useUpdated();



    // ---------- CONSTS ----------

    const id: number | null = route.params?.song?.id
        ? route.params.song.id
        : null;

    const updateScreen = id ? true : false;
    
    const initialName: string | null = route.params?.song?.name
        ? route.params.song.name
        : null;



    // ---------- TYPES ----------

    type ArtistProps = {
        obj: Artist;
        initial?: boolean; // <- Foi carregado inicialmente? (apenas para updateScreen)
        existing?: boolean; // <- Exite outro com mesmo nome no banco?
        equals?: string; // <- Existe outro com mesmo nome na lista? Se sim, qual?
    }

    type SubmitProps = {
        arts: ArtistProps[];
        delArtIds: number[];
    }



    // ---------- STATES ----------

    const [name, setName] = useState(initialName ? initialName : '');
    const [artists, setArtists] = useState<ArtistProps[]>([{ obj: { name: '' } }]);
    // IDs dos artistas deletados (usado na tela de update)
    const [deletedArtistIds, setDeletedArtistIds] = useState<number[]>([]);
    // Artistas da pesquisa (exibidos com )
    const [researchArtists, setResearchArtists] = useState<Artist[]>([]);
    // Index do campo de artista com foco (usado pra exibir 'researchArtists')
    const [currentFocusIndex, setCurrentFocusIndex] = useState<number | null>(null);
    // IDs de artistas já utilizados (para que não sejam exibidos na pesquisa)
    const [restrictedIds, setRestrictedIds] = useState<number[]>([]);

    const [disabledSubmit, setDisabledSubmit] = useState<boolean>(true);
    // Impede que o onBlur do TextInput do artista seja chamado depois
    // do onPress do Pressable 'Salvar' ser pressionado
    const [saving, setSaving] = useState<boolean>(false);



    // ---------- FUNCTIONS ----------

    /**
     * ATENÇÃO: Dados devem ser validados antes por 'validateSubmit()'
     */
    function handleSubmit(submitProps: SubmitProps)
    {
        const { arts, delArtIds } = submitProps;

        // Remover campos em branco
        const validArtists: ArtistProps[] = arts.filter(art =>
            art.obj.name.trim().length !== 0
        );

        // UPDATE
        if(updateScreen)
        {
            if(id === null)
                return;

            let back = true;

            // Atualizar nome da música
            if(name !== initialName)
            {
                SongService.update({ id, name })
                .catch(err =>
                {
                    back = false;
                    alert(err);
                });
            }

            // Deletar link entre artistas já existentes e a música
            if(delArtIds.length !== 0)
                SongArtistService.delete(id, delArtIds)
                .catch(err =>
                {
                    back = false;
                    alert(err);
                });

            const newArtists: Artist[] = [];
            const oldArtistIds: number[] = [];

            validArtists.forEach(art =>
            {
                if(art.obj.id === undefined)
                    newArtists.push(art.obj);
                else if(!art.initial)
                    oldArtistIds.push(art.obj.id);
            });

            // Criar novos artistas e linká-los à música
            ArtistService.create(id, newArtists)
            .catch(err =>
            {
                back = false;
                alert(err);
            })

            // Linkar artistas já existentes à música
            SongArtistService.create(id, oldArtistIds)
            .catch(err =>
            {
                back = false;
                alert(err);
            })

            if(back)
            {
                SongService.findById(id)
                .then((song: any) =>
                {
                    setUpdated({ song });
                    navigation.navigate('Song', { song });
                })
                .catch(err => alert(err));
            }
        }
        // NEW
        else
        {
            SongService.create({ name }, validArtists.map(({ obj }) => obj))
            .then(insertId =>
            {
                SongService.findById(insertId)
                .then((song: any) =>
                {
                    // Diz à 'HomeScreen' que músicas devem ser atualizadas
                    setUpdated({ song });

                    // Impede que, ao clicar em voltar, volte para 'NewSongScreen'
                    navigation.pop(1);
                    // Ir para tela da música
                    navigation.navigate('Song', { song });
                })
                .catch(err => alert(err));
            })
            .catch(err => alert(err));
        }
    }
    
    function handleSearch(text: string)
    {
        if(text.trim().length === 0)
        {
            setResearchArtists([]);
            return;
        }

        ArtistService.findByNameSearch(text.trim(), restrictedIds)
            .then((res: any) => setResearchArtists(res._array))
            .catch(err => alert(err));
    }

    function validateArtists(artist: ArtistProps, i: number, newValue: string)
    {
        newValue = newValue.replace(',', '');

        const updArtists: ArtistProps[] = [...artists];
        const oldArtistName = artist.obj.name.trim().toUpperCase();
        const newArtistName = newValue.trim().toUpperCase();

        let existing: boolean = false;
        let equals: string | undefined = undefined;

        const oldEqualIds: number[] = [];

        updArtists.forEach((art, j) =>
        {
            if(i !== j)
            {
                // Guarda 'equals' antigos para, talvez, removê-los posteriormente
                if(art.equals !== undefined
                && art.equals === oldArtistName)
                {
                    oldEqualIds.push(j);
                }
                else if(newArtistName === artists[j].obj.name.trim().toUpperCase())
                {
                    if(updArtists[j].obj.id !== undefined)
                    {
                        existing = true;
                    }
                    else
                    {
                        equals = newArtistName;
                        updArtists[j].equals = newArtistName;
                    }
                }
            }

            //return { ...art, existing: false, equals: false };
        });

        updArtists[i].existing = existing;
        updArtists[i].equals = equals;

        // Remove 'equals' antigos
        if(oldEqualIds.length === 1)
            updArtists[oldEqualIds[0]].equals = undefined;

        // Atualiza nome
        updArtists[i].obj.name = newValue;
        setArtists(updArtists);

        validadeSubmit(name, updArtists);
    }

    function validadeSubmit(name: string, arts: ArtistProps[])
    {
        let unfilledArtists = true;

        // Validar nome
        if(name.trim().length === 0)
        {
            setDisabledSubmit(true);
            return;
        }

        // Validar artistas
        for(const artist of arts)
        {
            if(artist.obj.name.trim().length !== 0)
            {
                if(artist.existing || artist.equals !== undefined)
                {
                    setDisabledSubmit(true);
                    return;
                }

                unfilledArtists = false;
            }
        }

        setDisabledSubmit(unfilledArtists);
    }

    function overwriteArtist(artist: ArtistProps, i: number): SubmitProps
    {
        // Verificar se nome está entre os pesquisados.
        // Se sim, substitui a linha pelo pesquisado encontrado
        if(!artist.existing && artist.equals !== undefined)
            return {
                arts: artists,
                delArtIds: deletedArtistIds
            }

        const artistsAux: ArtistProps[] = [...artists];
        const delArtIdsAux: number[] = [...deletedArtistIds];

        // Roda todos os artistas pesquisados
        for(const researchArt of researchArtists)
            // Se nome do pesquisado for igual ao do campo
            if(artist.obj.name.trim().toUpperCase() === researchArt.name.toUpperCase())
            {
                if(researchArt.id !== undefined)
                    setRestrictedIds([ ...restrictedIds, researchArt.id ]);

                let initial: boolean = false;
                if(updateScreen)
                    // Remove artista da lista dos que devem ser deletados.
                    // Isso ocorrerá caso o ítem seja inicial. Por isso,
                    // deve ser reconfigurado como initial = true
                    for(let j = 0; j < delArtIdsAux.length; j++)
                        if(researchArt.id === delArtIdsAux[j])
                        {
                            delArtIdsAux.splice(j, 1);
                            initial = true;
                            break;
                        }

                artistsAux[i] = { obj: researchArt, initial };
                break;
            }

        setArtists(artistsAux);
        setDeletedArtistIds(delArtIdsAux);

        return {
            arts: artistsAux,
            delArtIds: delArtIdsAux
        };
    }


    // ---------- EFFECTS ----------

    /**
     * Carrega os artistas caso uma música tenha sido passada para a rota
     */
    useEffect(() =>
    {
        if(id)
            ArtistService.findBySongId(id)
            .then((res: any) =>
            {
                setArtists(res._array.map((obj: Artist) =>
                {
                    return { obj, initial: true };
                }));

                setRestrictedIds(res._array.map(({ id }: Artist) => id));
            })
            .catch(err => alert(err));
    },
    [id]);



    // ---------- RETURN ----------

    return (
        <ScrollView
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        style={[ styles.input, styles.textInput ]}
                        autoCapitalize='words'
                        value={name}
                        onChangeText={text =>
                        {
                            setName(text);
                            validadeSubmit(text, artists);
                        }}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Artistas / bandas</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexGrow: 1 }}>
                            {artists.map((artist, i) =>
                            {
                                const deletable = artists.length > 1 || artists[0].obj.id;
                                const showStatus =
                                    artist.obj.id === undefined &&
                                    artist.obj.name.trim().length !== 0;

                                let statusStyle: ViewStyle = {};
                                if(artist.existing || artist.equals !== undefined)
                                    statusStyle = {
                                        backgroundColor: `rgba(${colors.redLightRGB}, 0.08)`,
                                        borderColor: colors.redLight,
                                    };
                                else if(artist.obj.id !== undefined)
                                    statusStyle = {
                                        backgroundColor: `rgba(${colors.primaryRGB}, 0.2)`,
                                        borderColor: colors.primary,
                                    };

                                return (
                                    <View key={i}>
                                        <View
                                            style={[
                                                styles.input,
                                                statusStyle,
                                                {
                                                    marginTop: i !== 0 ? 6 : 0,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'stretch',
                                                }
                                            ]}
                                        >
                                            <TextInput
                                                style={styles.textInput}
                                                autoCapitalize='words'
                                                value={artist.obj.name}
                                                onChangeText={text =>
                                                {
                                                    handleSearch(text);
                                                    validateArtists(artist, i, text);
                                                }}
                                                onFocus={() =>
                                                {
                                                    // Remove marcação de 'já existente' (id !== undefined).
                                                    // Para isso, seta id como undefined
                                                    /*if(artist.obj.id !== undefined)
                                                    {
                                                        // Remove-o da lista de artistas restritos
                                                        // para que volte a aparecer nas pesquisar durante
                                                        // o preenchimento dos TextInput de artistas
                                                        setRestrictedIds(restrictedIds.filter(restId =>
                                                            restId !== artist.obj.id
                                                        ));

                                                        artist.obj.id = undefined;
                                                    }*/

                                                    handleSearch(artist.obj.name);
                                                    setCurrentFocusIndex(i);
                                                }}
                                                onBlur={() =>
                                                {
                                                    if(!saving)
                                                    {
                                                        overwriteArtist(artist, i);
                                                        setCurrentFocusIndex(null);
                                                    }
                                                }}
                                                editable={!artist.obj.id}
                                            />

                                            {showStatus ?
                                                <Text style={{
                                                    alignSelf: 'center',
                                                    color: artist.existing || artist.equals !== undefined
                                                        ? colors.red
                                                        : colors.primary,
                                                    fontSize: 12,
                                                    marginRight: deletable ? 0 : 12,
                                                }}>{artist.existing ? 'já inserido' : artist.equals !== undefined ? 'iguais' : 'novo'}</Text>
                                            : null}

                                            {deletable ?
                                                <Pressable
                                                    style={styles.deleteArtistBtn}
                                                    onPress={() =>
                                                    {
                                                        const array: ArtistProps[] = [...artists];

                                                        // Se for o último:
                                                        if(array.length === 1)
                                                        {
                                                            setDisabledSubmit(true);

                                                            // Se possuir ID:
                                                            if(array[0].obj.id !== undefined)
                                                                array.push({ obj: { name: '' } });
                                                        }
                                                        else
                                                            setDisabledSubmit(false);

                                                        // Se for um artista já cadastrado:
                                                        if(artist.obj.id !== undefined)
                                                        {
                                                            // Remove-o da lista de artistas restritos
                                                            // para que volte a aparecer nas pesquisar durante
                                                            // o preenchimento dos TextInput de artistas
                                                            setRestrictedIds(restrictedIds.filter(restId =>
                                                                restId !== artist.obj.id
                                                            ));

                                                            // Adiciona artista à lista de deletados
                                                            // para que, posteriormente, possa ser deletado do BD
                                                            if(artist.initial)
                                                                setDeletedArtistIds([ ...deletedArtistIds, artist.obj.id ]);
                                                        }

                                                        array.splice(i, 1);
                                                        setArtists(array);
                                                    }}
                                                >
                                                    <FeatherIcon name='x' size={14} color={colors.text} />
                                                </Pressable>
                                            : null}
                                        </View>

                                        {/* SUGESTÕES DE ARTISTAS */}
                                        {  currentFocusIndex !== null
                                        && currentFocusIndex === i
                                        && researchArtists.length !== 0 ?
                                        <View style={{ position: 'relative' }}>
                                            <View style={styles.researchArtists}>
                                                {researchArtists.map((researchArtist, j) =>
                                                    <Pressable
                                                        key={j}
                                                        style={[
                                                            styles.researchArtist,
                                                            {
                                                                backgroundColor: j % 2 === 0
                                                                    ? 'rgba(0, 0, 0, 0.08)'
                                                                    : 'rgba(0, 0, 0, 0.04)'
                                                            }
                                                        ]}
                                                        onPress={() =>
                                                        {
                                                            const array = [...artists];
                                                            array[i] = { obj: researchArtist };

                                                            // Adiciona à lista de artistas já adicionados
                                                            // para que não volte a aparecer nas pesquisas
                                                            if(researchArtist.id !== undefined)
                                                                setRestrictedIds([ ...restrictedIds, researchArtist.id ]);

                                                            setArtists(array);
                                                        }}
                                                    >
                                                        <Text>{ researchArtist.name }</Text>
                                                    </Pressable>
                                                )}
                                            </View>
                                        </View> : null}
                                    </View>
                                );
                            })}
                        </View>

                        <View style={{ marginLeft: 8 }}>
                            <View style={styles.line} />

                            <Pressable 
                                style={styles.btnAddArtist}
                                onPress={() => setArtists([ ...artists, { obj: { name: '' } } ])}
                            >
                                <FeatherIcon name='plus' size={15} color='#000000' />
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={[ styles.inputGroup, { flexDirection: 'row-reverse' } ]}>
                    <Pressable
                        style={[
                            styles.submit,
                            disabledSubmit ? {
                                opacity: opacities.disabled
                            } : null
                        ]}
                        onPress={() =>
                        {
                            setSaving(true);

                            const res: SubmitProps = currentFocusIndex !== null
                                ? overwriteArtist(
                                    artists[currentFocusIndex],
                                    currentFocusIndex
                                )
                                : { arts: artists, delArtIds: deletedArtistIds };

                            handleSubmit(res);
                        }}
                        disabled={disabledSubmit}
                    >
                        <Text style={styles.submitContent}>
                            {updateScreen ? 'Salvar' : 'Adicionar'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

export default NewSongScreen;

const styles = StyleSheet.create({
    // CONTAINER
    container: {
        width: '100%',
        padding: sizes.screenPadding,
    },

    // GENERAL INPUTS
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        marginLeft: 6,
        marginBottom: 6,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
    },
    textInput: {
        flex: 1,
        color: colors.text,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },

    // ARTISTS
    artistInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
    },
    deleteArtistBtn: {
        alignItems: 'center',
        justifyContent: 'space-around',
        width: 30,
    },
    line: {
        alignSelf: 'center',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        width: 4,
        marginBottom: 4,
        borderRadius: 999,
    },
    btnAddArtist: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        width: 30,
        height: 30,
        marginBottom: 2,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 999,
    },

    // RESEARCH ARTISTS
    researchArtists: {
        position: 'absolute',
        zIndex: 1,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: colors.inputBorder,
    },
    researchArtist: {
        paddingHorizontal: 12,
        paddingVertical: 9,
    },

    submit: {
        backgroundColor: colors.primary,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 999,
    },
    submitContent: {
        color: colors.text,
        fontSize: 16,
    },
});