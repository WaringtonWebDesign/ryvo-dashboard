"""Render a warm, lamp-lit living room with heavy depth-of-field blur.
Run headless:  blender -b --factory-startup --python lamp_room.py -- <output.jpg>
"""
import bpy, math, sys

out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "//bg-lamp.jpg"

# ── clean scene ──
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, color, rough=0.6, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    if emit:
        for key in ("Emission Color", "Emission"):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emit, 1)
                break
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = strength
    return m


def add(obj, material):
    obj.data.materials.append(material)
    return obj


def cube(loc, scale, material, bevel=0.06):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object
    o.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = o.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 4
    bpy.ops.object.shade_smooth()
    return add(o, material)


def cyl(loc, r, depth, material, r2=None, verts=48):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=depth, location=loc)
    o = bpy.context.object
    bpy.ops.object.shade_smooth()
    return add(o, material)


def sphere(loc, r, material, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=32, ring_count=16)
    o = bpy.context.object
    o.scale = scale
    bpy.ops.object.shade_smooth()
    return add(o, material)


# ── materials ──
plaster = mat("Plaster", (0.62, 0.43, 0.29), 0.95)
wood = mat("Wood", (0.20, 0.10, 0.045), 0.45)
fabric = mat("Sofa", (0.42, 0.22, 0.11), 0.95)
cream = mat("Cushion", (0.80, 0.68, 0.52), 0.9)
brass = mat("Brass", (0.55, 0.38, 0.16), 0.3)
dark = mat("Dark", (0.05, 0.035, 0.03), 0.6)
leaf = mat("Leaf", (0.06, 0.12, 0.05), 0.6)
pot = mat("Pot", (0.55, 0.32, 0.20), 0.8)
art = mat("Art", (0.75, 0.52, 0.32), 0.9)
shade = mat("Shade", (1.0, 0.85, 0.65), 0.9, emit=(1.0, 0.62, 0.32), strength=9.0)
bulb = mat("Bulb", (1.0, 0.8, 0.6), 0.5, emit=(1.0, 0.58, 0.28), strength=14.0)

# ── room ──
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
add(bpy.context.object, wood)
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 3.0, 0), rotation=(math.radians(90), 0, 0))
add(bpy.context.object, plaster)
bpy.ops.mesh.primitive_plane_add(size=30, location=(-4.2, 0, 0), rotation=(0, math.radians(90), 0))
add(bpy.context.object, plaster)
cube((0, 2.97, 0.06), (8, 0.03, 0.06), wood, bevel=0)  # skirting board

# ── sofa ──
cube((-0.75, 1.95, 0.32), (1.55, 0.5, 0.2), fabric)          # seat
cube((-0.75, 2.42, 0.72), (1.55, 0.16, 0.42), fabric)        # back
cube((-2.25, 1.95, 0.52), (0.16, 0.55, 0.32), fabric)        # arms
cube((0.75, 1.95, 0.52), (0.16, 0.55, 0.32), fabric)
for x in (-1.6, -0.3, 0.35):
    sphere((x, 2.2, 0.78), 0.26, cream, scale=(1.1, 0.45, 0.95))
cube((-0.2, 1.9, 0.65), (0.5, 0.35, 0.12), mat("Throw", (0.68, 0.36, 0.18), 0.95))

# ── floor lamp (right) ──
cyl((1.45, 2.1, 0.02), 0.22, 0.04, brass)
cyl((1.45, 2.1, 0.8), 0.015, 1.6, brass)
cyl((1.45, 2.1, 1.72), 0.32, 0.42, shade, r2=0.22)
bpy.ops.object.light_add(type="POINT", location=(1.45, 2.1, 1.68))
L = bpy.context.object.data
L.energy = 260
L.color = (1.0, 0.6, 0.3)
L.shadow_soft_size = 0.18
bpy.ops.object.light_add(type="AREA", location=(1.45, 2.1, 1.98))
A = bpy.context.object.data
A.energy = 120
A.color = (1.0, 0.62, 0.32)
A.size = 0.4

# ── side table + small lamp (left) ──
cyl((-2.9, 1.9, 0.3), 0.32, 0.6, wood)
cyl((-2.9, 1.9, 0.68), 0.09, 0.16, dark)
sphere((-2.9, 1.9, 0.86), 0.13, bulb)
bpy.ops.object.light_add(type="POINT", location=(-2.9, 1.9, 0.88))
L2 = bpy.context.object.data
L2.energy = 45
L2.color = (1.0, 0.55, 0.25)

# ── plant (far right) ──
cyl((2.55, 2.35, 0.25), 0.22, 0.5, pot, r2=0.17)
for (x, y, z, r) in [(2.55, 2.35, 0.75, 0.25), (2.4, 2.3, 1.0, 0.22), (2.7, 2.4, 1.05, 0.2),
                     (2.5, 2.45, 1.3, 0.18), (2.75, 2.3, 0.85, 0.18), (2.35, 2.4, 0.7, 0.17)]:
    sphere((x, y, z), r, leaf, scale=(1.0, 0.7, 1.2))

# ── picture frames on the wall ──
cube((-0.75, 2.97, 1.62), (0.5, 0.02, 0.34), dark, bevel=0.01)
cube((-0.75, 2.955, 1.62), (0.42, 0.02, 0.27), art, bevel=0)
cube((0.35, 2.97, 1.5), (0.18, 0.02, 0.24), dark, bevel=0.01)

# ── world: dim warm evening ambience ──
world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
bg.inputs["Color"].default_value = (0.05, 0.03, 0.02, 1)
bg.inputs["Strength"].default_value = 0.6

# ── camera with a very shallow focus, so the room is all soft bokeh ──
bpy.ops.object.camera_add(location=(0.1, -3.6, 1.15), rotation=(math.radians(86), 0, 0))
cam = bpy.context.object
scene.camera = cam
cam.data.lens = 28
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = 0.6
cam.data.dof.aperture_fstop = 0.9

# ── render ──
try:
    scene.render.engine = "CYCLES"
except TypeError as e:
    print("engine error", e)
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.cycles.device = "CPU"
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.quality = 82
try:
    scene.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("WROTE", out)
