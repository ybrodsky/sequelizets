import {
  Sequelize,
  Model,
  ModelDefined,
  ModelStatic,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  Association,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Optional,
  InitOptions,
} from 'sequelize';
import { URLSearchParams } from 'url';

const sequelize = new Sequelize("mysql://u@localhost:3306/ymci");

interface UserAttributes {
  id: number;
  name: string;
  surname: string;
};

interface CarAttributes {
  id: number;
  user_id: number;
  make: string;
}

interface CarCreationAttributes extends Optional<CarAttributes, "id"> {}
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class Car extends Model<CarAttributes, CarCreationAttributes> implements CarAttributes {
  public id!: number;
  public user_id!: number;
  public make!: string;

  // timestamps!
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public readonly User?: User;

  public static associations: {
    User: Association<User, Car>;
  }

  public static associate(models: any) {
    console.log('associate', this.belongsTo(models.User));
  };
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public surname!: string;

  // timestamps!
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associations: {
    Car: Association<Car, User>;
  }

  public static associate(models: any) {
    console.log('associate', this.hasOne(models.Car));
  };
}

Car.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  make: {
    type: new DataTypes.STRING(128),
    allowNull: false,
  },
}, {
  tableName: "cars",
  underscored: true,
  sequelize, // passing the `sequelize` instance is required
});

const u = User.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: new DataTypes.STRING(128),
    allowNull: false,
  },
  surname: {
    type: new DataTypes.STRING(128),
    allowNull: true,
  },
}, {
  tableName: "users",
  underscored: true,
  sequelize, // passing the `sequelize` instance is required
});

Car.belongsTo(User, {
  foreignKey: 'user_id',
});
User.hasOne(Car, {
  foreignKey: 'user_id',
})
// Car.associate({ User });
// User.associate({ Car });

interface iModels {
  User: typeof User,
  Car: typeof Car
}

const models: any = {
  User,
  Car,
}

const s = async () => {
  const user = await models.User.findOne({
    include: [{
      model: models.Car,
    }],
  });

  if (user) {
    const u = user.get();

    console.log(user.Car)
  }
  const car = await models.Car.findOne({
    attributes: ['id'],
    include: [models.Car.associations.User]
  });

  if (car) {
    console.log(car.id);
    console.log(car.User?.name);

    const created = await Car.create({
      user_id: car.User!.id,
      make: 'test',
    });

    console.log(created);
  }
}

s();