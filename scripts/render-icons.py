"""Render RYVO Dashboard app icons (emerald tile + white ring).
blender -b --factory-startup --python scripts/render-icons.py -- <output folder>
Writes icon-512.png, icon-192.png, apple-touch-icon.png (180).
The ring sits inside the central 60%, so icon-512 also works as a maskable icon.
"""
import bpy, math, os, sys

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "//"
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def emission_mat(name, color=None, gradient=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    if gradient:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
        nt.links.new(sep.outputs["Y"], ramp.inputs["Fac"])
        ramp.color_ramp.elements[0].color = (*gradient[0], 1)
        ramp.color_ramp.elements[1].color = (*gradient[1], 1)
        nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    else:
        em.inputs["Color"].default_value = (*color, 1)
    return m


# Background tile: emerald gradient (linear values ≈ #047857 → #34d399)
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
bpy.context.object.data.materials.append(emission_mat("Tile", gradient=((0.0018, 0.18, 0.1), (0.04, 0.65, 0.33))))

# White ring: white disc with a tile-coloured disc on top
bpy.ops.mesh.primitive_circle_add(vertices=128, radius=0.52, fill_type="NGON", location=(0, 0, 0.01))
bpy.context.object.data.materials.append(emission_mat("Ring", color=(1, 1, 1)))
bpy.ops.mesh.primitive_circle_add(vertices=128, radius=0.32, fill_type="NGON", location=(0, 0, 0.02))
bpy.context.object.data.materials.append(emission_mat("Hole", gradient=((0.0018, 0.18, 0.1), (0.04, 0.65, 0.33))))
# The hole's generated coords differ from the tile's, so give it a flat mid-emerald instead
hole = bpy.context.object
hole.data.materials.clear()
hole.data.materials.append(emission_mat("HoleFlat", color=(0.012, 0.36, 0.19)))

# Small amber dot (a "light on" accent)
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=0.085, fill_type="NGON", location=(0.42, 0.42, 0.03))
bpy.context.object.data.materials.append(emission_mat("Dot", color=(1.0, 0.62, 0.2)))

bpy.ops.object.camera_add(location=(0, 0, 5))
cam = bpy.context.object
cam.data.type = "ORTHO"
cam.data.ortho_scale = 2.0
scene.camera = cam

world = bpy.data.worlds.new("W")
scene.world = world
scene.render.engine = "CYCLES"
scene.cycles.samples = 16
scene.cycles.use_denoising = False
scene.cycles.device = "CPU"
scene.view_settings.view_transform = "Standard"
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.render.film_transparent = False

for name, size in (("icon-512.png", 512), ("icon-192.png", 192), ("apple-touch-icon.png", 180)):
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.filepath = os.path.join(out_dir, name)
    bpy.ops.render.render(write_still=True)
    print("WROTE", scene.render.filepath)
