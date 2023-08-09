using System.Collections;
using System.Collections.Generic;
using UnityEngine;
namespace Shapes
{
    [ExecuteAlways]
    public class DynamicUI : ImmediateModeShapeDrawer
    {
        public override void DrawShapes(Camera cam)
        {
            using (Draw.Command(cam))
            {
                // Sets up all static parameters.
                // These are used for all following Draw.Line calls
                Draw.LineGeometry = LineGeometry.Volumetric3D;
                Draw.ThicknessSpace = ThicknessSpace.Pixels;
                Draw.Thickness = 4; // 4px wide
                                    // draw lines
                Draw.Text(
                    cam.ScreenToWorldPoint(
                        new Vector3(32, Screen.height + 32, 1)
                    ),
                    "Alpha version",
                    Color.cyan
                );
            }
        }
    }
}