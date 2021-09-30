import React from 'react';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Components
import GenericAppHeader from '../GenericAppHeader';

const ArtistHeader: React.FC = () =>
{
    return (
        <GenericAppHeader
            menuItems={[
                {
                    icon: {
                        component: FeatherIcon,
                        name: 'edit-2',
                    },
                    text: 'Editar',
                    onClick: () => alert('TESTE'),
                }
            ]}
        />
    );
}

export default ArtistHeader;