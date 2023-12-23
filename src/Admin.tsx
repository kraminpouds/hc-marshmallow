import { Badge, Button, Flex, Input, Layout, List, Menu, MenuProps, Modal, Segmented, Switch, theme, Typography } from 'antd';
import axios from 'axios';
import * as dayjs from 'dayjs'
import { useEffect, useState } from 'react';
import { Box, Letter } from './model';

function Admin() {
    const [box, setBox] = useState<Box>();
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [items, setItems] = useState<MenuProps.items>([]);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [unreadItems, setUnreadItems] = useState<Letter[]>([]);
    const [readItems, setReadItems] = useState<Letter[]>([]);
    const [isRead, setIsRead] = useState<boolean>(false);
    const [remarkLetter, setRemarkLetter] = useState<Letter>();
    const [remark, setRemark] = useState<string>('');
    const [showAddBoxModal, setShowAddBoxModal] = useState<boolean>(false);
    const [boxName, setBoxName] = useState<string>('');

    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    useEffect(() => {
        axios.get('/api/box/all').then(r => setBoxes(r.data));
    }, []);

    useEffect(() => {
        setItems(boxes.map(d=>({
            key: d.uuid,
            label: d.name
        })));
    }, [boxes]);

    useEffect(() => {
        if(box) {
            axios.get(`/api/letter/${box.uuid}`).then(r => setLetters(r.data));
        } else {
            setLetters([]);
        }
    }, [box]);

    useEffect(() => {
        setUnreadItems(letters.filter(l=>!l.isRead).sort((x,y)=>y.createDate-x.createDate));
        setReadItems(letters.filter(l=>l.isRead).sort((x,y)=>y.createDate-x.createDate));
    }, [letters]);

    useEffect(() => {
        setRemark(remarkLetter?.remark??'');
    }, [remarkLetter]);

    const toggleReadState = (letter: Letter) => {
        const newLetter = {
            ...letter,
            isRead: !letter.isRead
        };
        axios.patch(`/api/letter`, newLetter).then(() => {
            setLetters([...letters.filter(l=>l!==letter), newLetter]);
        });
    }

    const updateRemark = () => {
        if(!remarkLetter) return;
        const newLetter = {
            ...remarkLetter,
            remark: remark
        };
        axios.patch(`/api/letter`, newLetter).then(() => {
            setLetters([...letters.filter(l=>l!==remarkLetter), newLetter]);
            setRemarkLetter(undefined);
        });
    }

    const selectMenu = (uuid: string) => {
        const box = boxes.find(b=>b.uuid === uuid);
        setBox(box);
    }

    const updateBoxName = (name: string) => {
        if(!box) return;
        const newBox = {
            ...box,
            name: name
        };
        axios.patch(`/api/box`, newBox).then(() => {
            setBoxes(boxes.map(b=> b === box ? newBox: b));
            setBox(newBox);
        });
    }

    const updateBoxDescription = (description: string) => {
        if(!box) return;
        const newBox = {
            ...box,
            description: description
        };
        axios.patch(`/api/box`, newBox).then(() => {
            setBoxes(boxes.map(b=> b === box ? newBox: b));
            setBox(newBox);
        });
    }

    const toggleBoxState = () => {
        if(!box) return;
        const newBox = {
            ...box,
            enabled: !box.enabled
        };
        axios.patch(`/api/box`, newBox).then(() => {
            setBoxes(boxes.map(b=> b === box ? newBox: b));
            setBox(newBox);
        });
    }

    const addBox = (name: string) => {
        const newBox = {
            name,
            description: '',
        };
        axios.put(`/api/box`, newBox).then((res) => {
            setBoxes([...boxes, res.data]);
            setShowAddBoxModal(false);
        });
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout.Header className={'title-admin'}>
                狐乱生草の棉花糖 - 后台
                <Button type="text" style={{ color: 'white' }} onClick={()=> {
                    setBoxName('')
                    setShowAddBoxModal(true)
                }}>添加信箱</Button>
                <Modal
                    title="添加新的信箱"
                    centered
                    open={showAddBoxModal}
                    onOk={() => addBox(boxName)}
                    onCancel={() => setShowAddBoxModal(false)}
                >
                    <Input value={boxName} onChange={(e)=>setBoxName(e.target.value)} />
                </Modal>
            </Layout.Header>
            <Layout>
                <Layout.Sider>
                    <Menu mode="inline"
                          items={items}
                          style={{ height: '100%', borderRight: 0 }}
                          onClick={(e)=>selectMenu(e.key)} />
                </Layout.Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                    <Flex align={'center'} justify={'space-between'}>
                        <Flex vertical>
                            <Typography.Title editable={ !!box && { onChange: updateBoxName }} level={2}>{ box?.name ?? '← 选择一个信箱' }</Typography.Title>
                            <Typography.Text editable={ !!box && { onChange: updateBoxDescription }}>{ box?.description }</Typography.Text>
                        </Flex>
                        <Switch disabled={!box} checkedChildren="开启" unCheckedChildren="关闭" checked={box?.enabled} onChange={toggleBoxState} />
                    </Flex>
                    <Layout.Content style={{
                        padding: 24,
                        margin: "24px 0 0 0",
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}>
                        <Badge count={unreadItems.length}>
                            <Segmented options={[
                                { label: '已读', value: true},
                                { label: '未读', value: false},
                            ]} value={isRead} onChange={setIsRead} style={{ marginBottom: '8px'}} />
                        </Badge>
                        <List bordered
                              pagination={!!letters.length}
                              dataSource={isRead?readItems:unreadItems}
                              itemLayout='vertical'
                              renderItem={(item) => (
                            <List.Item key={item.uuid} actions={[
                                (<a onClick={()=>setRemarkLetter(item)} style={{marginTop: '8px'}}>备注</a>),
                                (<a onClick={()=>toggleReadState(item)}>
                                    {isRead?'标记未读':'标记已读'}
                                </a>),
                            ]}>
                                <List.Item.Meta title={dayjs(item.createDate).format('YYYY年M月D日 H:mm:ss')} description={item.remark} />
                                {item.content}
                            </List.Item>
                        )} />
                        <Modal
                            title="备注"
                            centered
                            open={!!remarkLetter}
                            onOk={() => updateRemark()}
                            onCancel={() => setRemarkLetter(undefined)}
                        >
                            <Input value={remark} onChange={(e)=>setRemark(e.target.value)} />
                        </Modal>
                    </Layout.Content>
                </Layout>
            </Layout>
        </Layout>
    )
}

export default Admin
