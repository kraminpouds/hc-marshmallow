import { Badge, Input, Layout, List, Menu, MenuProps, Modal, Segmented, theme } from 'antd';
import axios from 'axios';
import * as dayjs from 'dayjs'
import { useEffect, useState } from 'react';
import { Box, Letter } from './model';

function Admin() {
    const [box, setBox] = useState<string>('');
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [items, setItems] = useState<MenuProps.items>([]);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [unreadItems, setUnreadItems] = useState<Letter[]>([]);
    const [readItems, setReadItems] = useState<Letter[]>([]);
    const [isRead, setIsRead] = useState<boolean>(false);
    const [remarkLetter, setRemarkLetter] = useState<Letter>();
    const [remark, setRemark] = useState<string>('');

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
            axios.get(`/api/letter/${box}`).then(r => setLetters(r.data));
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

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout.Header className={'title-admin'}>
                狐乱生草の棉花糖 - 后台
            </Layout.Header>
            <Layout>
                <Layout.Sider>
                    <Menu mode="inline"
                          defaultSelectedKeys={[items[0]?.key]}
                          items={items}
                          style={{ height: '100%', borderRight: 0 }}
                          onClick={(e)=>setBox(e.key)} />
                </Layout.Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                    <Layout.Content style={{
                        padding: 24,
                        margin: 0,
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
                            style={{ top: 20 }}
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
