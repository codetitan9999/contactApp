import React from "react";
class AddContacts extends React.Component {
    state= {
        name:"",
        mobile:"",
    };
    add= (e)=>{
        e.preventDefault();
        if(this.state.name===""&& this.state.mobile==="") {
            alert("all the fields are mandatory")
            return;
        }
        this.props.addContactHandler(this.state);
        this.setState({name:"", mobile:""});
        console.log(this.state);
     }
    render() {
        return (
            <div className="ui main">
                <h1>Add Contact</h1>
                <form className="ui form" onSubmit={this.add}>
                    <div className="field">
                        <label >Name</label>
                        <input type="text" name="name" placeholder="Name" value={this.state.name} onChange={ (e) =>this.setState({ name: e.target.value}) }/>

                    </div>
                    <div className="field">
                        <label >Mobile Number</label>
                        <input type="text" name="email" placeholder="Mobile Number" value={this.state.mobile} onChange={ (e)=> this.setState({mobile: e.target.value}) }/>

                    </div>
                    <button className="ui button blue">Add</button>
                </form>
            </div>
        )
    }
} 
export default AddContacts;