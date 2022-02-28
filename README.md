# Prong4K - Raytrace like it is 2004

![Prong tracing](img/gameplay.gif?raw=true "Gameplay")

This was my entry to the Java4k competition in the year **2004**. It is suppose to be a clone of a famous game from the seventies but my version lacks some real gameplay.

## Source

The original source was written in Java and executed as an applet, this is a straight port to JavaScript. The rendering is being done by raytracing a simple scene with shadows and reflections. The original goal was to maintain a framerate above 20 frames per second. To reach this the scene was kept very simple with only four primitives and the resolution was also kept very low. In addition to this the rendering is being done in a subsampling pattern. Each block of 5x5 pixels are first rendered at the corner pixels. If they are not zero, i.e., black then the block is subdivided into four smaller blocks and rendered again.

![Alt text](img/prong_heat.png?raw=true "Title")

This is a visualisation where the skipped blocks are marked as red, subdivided blocks are blue and the green blocks are regular raytraced.
