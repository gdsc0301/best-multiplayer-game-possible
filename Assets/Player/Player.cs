using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{
    public float gasPower, torquePower, maxSpeed = 5;

    private float gasInput, hInput, vInput;
    private Rigidbody2D rb;

    // Start is called before the first frame update
    void Start()
    {
        rb = this.GetComponent<Rigidbody2D>();
    }

    // Update is called once per frame
    void Update()
    {
        gasInput = Input.GetAxis("Gas");
        hInput = Input.GetAxis("Horizontal");
        vInput = Input.GetAxis("Vertical");
    }

    private void FixedUpdate()
    {
        rb.AddRelativeForce(new Vector2(0, gasInput * gasPower));
        rb.AddTorque(-Input.GetAxis("Horizontal") * torquePower);
    }
}
