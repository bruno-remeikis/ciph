import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps, ViewStyle } from 'react-native';

interface FadeAnimProps {
	visible: boolean;
	property: 'opacity' | 'elevation';

	initial: { value: number; time: number };
	final:   { value: number; time: number };
}

const Fade: React.FC<FadeAnimProps & ViewProps> = ({ visible, property, initial, final, ...props }) =>
{
	// Initial value for opacity: 0
	const fadeAnim = useRef(new Animated.Value(final.value)).current;

	const fadeStyle: Animated.WithAnimatedObject<ViewStyle> = {};
	fadeStyle[property] = fadeAnim;

	function fade()
	{
		Animated.timing(fadeAnim, {
			toValue: visible
				? final.value
				: initial.value,
			duration: visible
				? final.time
				: initial.time,
			useNativeDriver: false,
		}).start();
	}

	useEffect(() => fade(), [visible]);

	return (
		<Animated.View
			{...props}
			style={[ props.style, fadeStyle ]}
		>
			{props.children}
		</Animated.View>
	);
}

export default Fade;